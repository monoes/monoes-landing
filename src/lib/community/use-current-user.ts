"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
};

export function useCurrentUser(): CurrentUser | null | undefined {
  const [me, setMe] = useState<CurrentUser | null | undefined>(undefined);

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

  return me;
}
