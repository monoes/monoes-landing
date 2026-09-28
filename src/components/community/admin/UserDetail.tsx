import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminUserDetail } from "@/lib/community/admin-user-data";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return `${new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">{title}</p>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-espresso/55">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-espresso">{children}</dd>
    </div>
  );
}

const EMPTY = <p className="text-sm text-espresso/55">None.</p>;

export function UserDetail({ detail }: { detail: AdminUserDetail }) {
  const { profile, accounts, sessions, connectedApps, counts, timeline } = detail;

  const stats = [
    { label: "Posts", value: counts.posts },
    { label: "Feature requests", value: counts.features },
    { label: "Bug reports", value: counts.bugs },
    { label: "Comments", value: counts.bugComments + counts.orgComments + counts.blogComments },
    { label: "Orgs uploaded", value: counts.orgUploads },
    { label: "Org runs", value: counts.orgRuns },
    { label: "Votes cast", value: counts.votes },
    { label: "Storage used", value: formatBytes(counts.storageBytes) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar bytes are served from our own R2-backed route or the OAuth provider
          <img src={profile.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ivory-parchment text-xl font-medium text-espresso/70">
            {(profile.name || profile.email).charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold text-espresso tracking-tight">{profile.name}</h1>
          <p className="text-sm text-espresso/55">
            {profile.email}
            {profile.username && (
              <>
                {" · "}
                <Link href={`/community/u/${profile.username}`} className="hover:underline">
                  @{profile.username}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <Section title="Account">
        <dl className="grid grid-cols-1 gap-4 rounded-lg border border-ivory-linen p-4 sm:grid-cols-3">
          <Field label="User ID">
            <code className="text-xs">{profile.id}</code>
          </Field>
          <Field label="Role">{profile.role}</Field>
          <Field label="Status">
            {profile.blockedAt ? (
              <span className="text-red-700">
                Blocked {formatDateTime(profile.blockedAt)}
                {profile.blockedByUsername ? ` by @${profile.blockedByUsername}` : ""}
              </span>
            ) : (
              "Active"
            )}
          </Field>
          <Field label="Email verified">{profile.emailVerified ? "Yes" : "No"}</Field>
          <Field label="Joined">{formatDateTime(profile.createdAt)}</Field>
          <Field label="Profile last updated">{formatDateTime(profile.updatedAt)}</Field>
          <Field label="Last active">{formatDateTime(profile.lastActiveAt)}</Field>
          <Field label="Stored sessions">{profile.sessionCount}</Field>
          <Field label="Sign-in methods">
            {accounts.length ? accounts.map((a) => `${a.provider} (added ${formatDateTime(a.linkedAt)})`).join(", ") : "—"}
          </Field>
        </dl>
      </Section>

      <Section title="Profile">
        <dl className="grid grid-cols-1 gap-4 rounded-lg border border-ivory-linen p-4 sm:grid-cols-3">
          <Field label="Tagline">{profile.tagline ?? "—"}</Field>
          <Field label="Job title">{profile.jobTitle ?? "—"}</Field>
          <Field label="Company">{profile.company ?? "—"}</Field>
          <Field label="Tags">{profile.tags.length ? profile.tags.join(", ") : "—"}</Field>
          <Field label="Links">
            {profile.links.length
              ? profile.links.map((l) => (
                  <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="mr-3 underline">
                    {l.label}
                  </a>
                ))
              : "—"}
          </Field>
        </dl>
      </Section>

      <Section title="Activity totals">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-ivory-linen bg-ivory-warm p-4 text-center">
              <p className="text-2xl font-semibold text-espresso">{s.value}</p>
              <p className="mt-1 text-xs text-espresso/55">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Sessions & devices">
        <p className="mb-2 text-xs text-espresso/55">Signing out deletes a session, so this shows only sessions still stored.</p>
        {sessions.length === 0 ? (
          EMPTY
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ivory-linen">
            <table className="w-full text-left text-sm">
              <thead className="bg-ivory-parchment text-espresso/55">
                <tr>
                  <th className="px-4 py-2">Device</th>
                  <th className="px-4 py-2">IP address</th>
                  <th className="px-4 py-2">Signed in</th>
                  <th className="px-4 py-2">Last seen</th>
                  <th className="px-4 py-2">Expires</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-ivory-linen">
                    <td className="px-4 py-2 text-espresso" title={s.userAgent ?? undefined}>
                      {s.device}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-espresso/70">{s.ipAddress ?? "—"}</td>
                    <td className="px-4 py-2 text-espresso/55">{formatDateTime(s.signedInAt)}</td>
                    <td className="px-4 py-2 text-espresso/55">{formatDateTime(s.lastSeenAt)}</td>
                    <td className="px-4 py-2 text-espresso/55">{formatDateTime(s.expiresAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Connected apps & agents">
        {connectedApps.length === 0 ? (
          EMPTY
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ivory-linen">
            <table className="w-full text-left text-sm">
              <thead className="bg-ivory-parchment text-espresso/55">
                <tr>
                  <th className="px-4 py-2">App</th>
                  <th className="px-4 py-2">Scopes</th>
                  <th className="px-4 py-2">Authorized</th>
                  <th className="px-4 py-2 text-right">Tokens issued</th>
                  <th className="px-4 py-2">Last token</th>
                </tr>
              </thead>
              <tbody>
                {connectedApps.map((a) => (
                  <tr key={a.clientId} className="border-t border-ivory-linen">
                    <td className="px-4 py-2 text-espresso">{a.name}</td>
                    <td className="px-4 py-2 text-xs text-espresso/70">{a.scopes.join(", ") || "—"}</td>
                    <td className="px-4 py-2 text-espresso/55">{formatDateTime(a.authorizedAt)}</td>
                    <td className="px-4 py-2 text-right text-espresso">{a.tokensIssued}</td>
                    <td className="px-4 py-2 text-espresso/55">{formatDateTime(a.lastTokenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Activity timeline">
        {timeline.length === 0 ? (
          EMPTY
        ) : (
          <ol className="divide-y divide-ivory-linen rounded-lg border border-ivory-linen">
            {timeline.map((item, i) => (
              <li key={`${item.kind}-${item.at}-${i}`} className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-espresso">
                    {item.href ? (
                      <Link href={item.href} className="hover:underline">
                        {item.label}
                      </Link>
                    ) : (
                      item.label
                    )}
                  </p>
                  {item.detail && <p className="break-words text-xs text-espresso/55">{item.detail}</p>}
                </div>
                <time dateTime={item.at} className="shrink-0 text-xs text-espresso/55">
                  {formatDateTime(item.at)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}
