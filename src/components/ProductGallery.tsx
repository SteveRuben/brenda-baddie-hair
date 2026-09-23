"use client";

import { useState } from "react";

type Img = { id: string; url: string; alt?: string | null };

export default function ProductGallery({
  images,
  productName,
}: {
  images: Img[];
  productName: string;
}) {
  const [selected, setSelected] = useState(0);
  const list = images.length > 0 ? images : [{ id: "placeholder", url: "/images/placeholder.svg", alt: productName }];
  const current = list[Math.min(selected, list.length - 1)];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl bg-brand-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={current.url}
          alt={current.alt ?? productName}
          className="h-full w-full object-cover"
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Voir la photo ${i + 1}`}
              className={`aspect-square overflow-hidden rounded-xl bg-brand-50 transition ${
                i === selected
                  ? "ring-2 ring-brand-600 ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? `${productName} — photo ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
