"use client";

import { useState } from "react";
import { ExternalLinkIcon, FileTextIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseVideoEmbed } from "@/lib/portfolio/embed";
import type { PublicPortfolioItem } from "@/lib/public-profile/types";

interface PortfolioSectionProps {
  items: PublicPortfolioItem[];
}

export function PortfolioSection({ items }: PortfolioSectionProps) {
  const [lightbox, setLightbox] = useState<PublicPortfolioItem | null>(null);

  const images = items.filter((item) => item.kind === "image");
  const rest = items.filter((item) => item.kind !== "image");

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        포트폴리오
      </h2>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightbox(item)}
              className="group overflow-hidden rounded-lg border text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.title}
                loading="lazy"
                className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="p-2">
                <p className="truncate text-sm font-medium">{item.title}</p>
                {item.description ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {rest.map((item) => (
        <PortfolioItemCard key={item.id} item={item} />
      ))}

      <Dialog
        open={lightbox !== null}
        onOpenChange={(open) => {
          if (!open) setLightbox(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle>{lightbox?.title}</DialogTitle>
          {lightbox?.description ? (
            <DialogDescription>{lightbox.description}</DialogDescription>
          ) : null}
          {lightbox ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={lightbox.url}
              alt={lightbox.title}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function PortfolioItemCard({ item }: { item: PublicPortfolioItem }) {
  if (item.kind === "video") {
    const embed = parseVideoEmbed(item.url);
    if (!embed) {
      return null;
    }

    return (
      <div className="space-y-2 rounded-lg border p-4">
        <p className="font-medium">{item.title}</p>
        {item.description ? (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        ) : null}
        <div className="aspect-video w-full overflow-hidden rounded-md">
          <iframe
            src={embed.embedUrl}
            title={item.title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </div>
    );
  }

  const Icon = item.kind === "file" ? FileTextIcon : ExternalLinkIcon;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="font-medium">{item.title}</p>
        {item.description ? (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">
          {item.kind === "file" ? "새 탭에서 열기 (PDF)" : "새 탭에서 열기"}
        </p>
      </div>
    </a>
  );
}
