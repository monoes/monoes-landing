"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Me = {
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
};

function initials(name: string | null, username: string | null): string {
  const source = name?.trim() || username?.trim() || "";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/community/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  if (me === undefined) {
    return <div className="h-8 w-8 rounded-full bg-ivory/10" aria-hidden="true" />;
  }

  if (me === null) {
    return (
      <Link href="/community/login" className="text-sm text-ivory/75 transition-colors hover:text-gold">
        Log in
      </Link>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="block h-8 w-8 overflow-hidden rounded-full border border-gold/40 transition-colors hover:border-gold"
      >
        {me.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar bytes are served from our own R2-backed route
          <img src={me.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-espresso text-xs font-semibold text-gold">
            {initials(me.name, me.username)}
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-md border border-ivory-linen bg-ivory py-1 shadow-soft-lg"
        >
          {me.username && (
            <Link
              href={`/community/u/${me.username}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-espresso hover:bg-ivory-warm"
            >
              My profile
            </Link>
          )}
          <Link
            href="/community/settings/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-espresso hover:bg-ivory-warm"
          >
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-ivory-warm"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
