"use client";

import { usePathname } from "next/navigation";

const GA_MEASUREMENT_ID = "G-6XTPLKPLFD";
const CLARITY_PROJECT_ID = "yj6qarbwal";

// Pages linked from browser-store listings must load no trackers.
const TRACKER_FREE_PATHS = ["/monoagent/privacy"];

export function Analytics() {
  const pathname = usePathname();
  if (TRACKER_FREE_PATHS.includes(pathname)) return null;

  return (
    <>
      {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
        <script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
        />
      )}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <script
        id="ga4-init"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
        }}
      />
      <script
        id="clarity-init"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_PROJECT_ID}");`,
        }}
      />
    </>
  );
}
