export type Profile = {
  name: string;
  username: string;
  tagline: string | null;
  jobTitle: string | null;
  company: string | null;
  tags: string[];
  githubUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  avatarUrl: string | null;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileCard({ profile }: { profile: Profile }) {
  const careerLine = [profile.jobTitle, profile.company].filter(Boolean).join(" at ");

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-ivory-linen bg-ivory p-8 text-center">
      {profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar bytes are served from our own R2-backed route, not optimizable by next/image's remote loader without extra config this phase doesn't need
        <img
          src={profile.avatarUrl}
          alt={`${profile.name}'s avatar`}
          className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-espresso/10 text-2xl font-semibold text-espresso">
          {initials(profile.name)}
        </div>
      )}
      <h1 className="text-2xl font-semibold text-espresso">{profile.name}</h1>
      <p className="text-sm text-espresso/55">@{profile.username}</p>
      {profile.tagline && <p className="mt-3 text-espresso">{profile.tagline}</p>}
      {careerLine && <p className="mt-1 text-sm text-espresso/70">{careerLine}</p>}
      {profile.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {profile.tags.map((tag) => (
            <span key={tag} className="rounded bg-espresso/10 px-2 py-0.5 text-xs font-medium text-espresso">
              {tag}
            </span>
          ))}
        </div>
      )}
      {(profile.githubUrl || profile.twitterUrl || profile.linkedinUrl || profile.websiteUrl) && (
        <div className="mt-5 flex justify-center gap-4 text-sm">
          {profile.githubUrl && (
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-espresso/70 hover:text-espresso">
              GitHub
            </a>
          )}
          {profile.twitterUrl && (
            <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-espresso/70 hover:text-espresso">
              X / Twitter
            </a>
          )}
          {profile.linkedinUrl && (
            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-espresso/70 hover:text-espresso">
              LinkedIn
            </a>
          )}
          {profile.websiteUrl && (
            <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-espresso/70 hover:text-espresso">
              Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}
