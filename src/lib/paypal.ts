import {
  Client,
  Environment,
  OrdersController,
  CheckoutPaymentIntent,
} from "@paypal/paypal-server-sdk";

function paypalClient() {
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID ?? "",
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? "",
    },
    environment:
      process.env.PAYPAL_MODE === "live" ? Environment.Production : Environment.Sandbox,
    // Timeout anti-blocage : un appel PayPal qui pend ne doit pas bloquer
    // la requête indéfiniment (DoS par épuisement des workers).
    timeout: 15000,
  });
}

export async function createPaypalOrder(totalUSD: string, reference: string) {
  const controller = new OrdersController(paypalClient());
  const { result } = await controller.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          referenceId: reference,
          amount: { currencyCode: "USD", value: totalUSD },
          description: `Brenda Baddie Hair — Commande ${reference}`,
        },
      ],
    },
  });
  return result;
}

export async function capturePaypalOrder(paypalOrderId: string) {
  const controller = new OrdersController(paypalClient());
  const { result } = await controller.captureOrder({ id: paypalOrderId });
  return result;
}

export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}
