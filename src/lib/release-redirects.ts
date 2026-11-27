// monoes.me/mono-agent/releases/latest/<file> is the second address mono-agent's installer and
// updater try (install.sh and internal/release in github.com/monoes/mono-agent), and a stable
// download link for every file of the latest release. GitHub serves the bytes: these are temporary
// redirects, so they follow each new release. Clients check the manifest's signature and each
// file's checksum themselves; nothing here is trusted by them.
const RELEASE = "https://github.com/monoes/mono-agent/releases/latest";

export const releaseRedirects = [
  {
    source: "/mono-agent/releases/latest",
    destination: RELEASE,
    permanent: false,
  },
  {
    // One plain file name only: no further path segments, no leading dot.
    source: "/mono-agent/releases/latest/:file([A-Za-z0-9][A-Za-z0-9_.-]*)",
    destination: `${RELEASE}/download/:file`,
    permanent: false,
  },
];
