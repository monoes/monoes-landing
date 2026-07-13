interface RepoStats {
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
}

const REPOS = [
  "monoes/mono-agent",
  "monoes/monomind",
  "monoes/mono-clip",
  "monoes/monotask",
] as const;

export type RepoName = (typeof REPOS)[number];

export async function getRepoStats(repo: RepoName): Promise<RepoStats> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      return { stars: 0, forks: 0, language: "Unknown", updatedAt: "" };
    }

    const data = await res.json();
    return {
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      language: data.language ?? "Unknown",
      updatedAt: data.updated_at ?? "",
    };
  } catch {
    return { stars: 0, forks: 0, language: "Unknown", updatedAt: "" };
  }
}

export async function getAllRepoStats() {
  const results = await Promise.all(
    REPOS.map(async (repo) => ({
      repo,
      stats: await getRepoStats(repo),
    }))
  );
  return Object.fromEntries(results.map((r) => [r.repo, r.stats]));
}
