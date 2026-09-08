"use client";

import { useState } from "react";
import { PRIMARY_SOCIAL_LINKS, SECONDARY_SOCIAL_LINKS } from "@/lib/social-links";
import { socialIcons } from "@/components/icons/social-icons";

export function FooterSocialLinks() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        {PRIMARY_SOCIAL_LINKS.map((link) => {
          const Icon = socialIcons[link.id];
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Monoes on ${link.name}`}
              title={link.name}
              className="text-ivory/60 transition-colors hover:text-gold"
            >
              <Icon className="h-5 w-5" />
            </a>
          );
        })}
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="text-xs text-ivory/40 transition-colors hover:text-gold"
        >
          {expanded ? "Less" : "More"}
        </button>
      </div>
      {expanded && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {SECONDARY_SOCIAL_LINKS.map((link) => {
            const Icon = socialIcons[link.id];
            return (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-ivory/40 transition-colors hover:text-gold"
              >
                <Icon className="h-3.5 w-3.5" />
                {link.name}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
