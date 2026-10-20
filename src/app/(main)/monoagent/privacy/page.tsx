import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy – MonoAgent and MonoAgent Bridge" },
  description:
    "MonoAgent and its Chrome extension MonoAgent Bridge run on your own computer. What each one handles, what leaves your machine, and why the extension asks for each permission.",
  alternates: { canonical: "/monoagent/privacy" },
  robots: { index: true, follow: true },
};

const LINK = "text-gold-dark underline underline-offset-2 hover:text-espresso";
const H2 = "text-2xl font-semibold text-espresso mb-4";
const H3 = "text-lg font-semibold text-espresso mb-2";
const LIST = "space-y-3 list-disc pl-5";

const PERMISSIONS: { name: string; why: string }[] = [
  {
    name: "Access to all sites (<all_urls>) and content scripts",
    why: "Automations, page saving, highlighting and the recorder work on whichever site you point them at, so there is no fixed list. Nothing is read from a page until you save, highlight, record, ask the chat or run an automation step. On load, the extension only asks your local app which highlights you saved for that address.",
  },
  {
    name: "activeTab",
    why: "Save or highlight the current page when you press the shortcut or the toolbar button.",
  },
  {
    name: "scripting",
    why: "Run the save, highlight and recorder code in the page and read the result back.",
  },
  {
    name: "tabs, tabGroups, webNavigation",
    why: "Open, find, group and wait for tabs during an automation, and know when a page has finished loading.",
  },
  {
    name: "debugger",
    why: "Send real keyboard and click events, and run steps on pages whose security policy blocks scripts. It attaches only to a tab being automated, and detaches after 30 seconds without traffic.",
  },
  {
    name: "cookies",
    why: "Tell an automation whether you are signed in to a site, and carry that session to your own local MonoAgent profile. Cookie values go only to the local app.",
  },
  {
    name: "storage",
    why: "Remember the pairing token, the chosen profile, and saves and tasks waiting while the app is not running.",
  },
  {
    name: "alarms",
    why: "Keep the connection to the local app alive and retry it. The extension’s background worker goes to sleep otherwise.",
  },
  {
    name: "contextMenus",
    why: "The “Add selection as task” and “Add page as task” right-click entries.",
  },
  {
    name: "sidePanel",
    why: "The extension’s main interface.",
  },
  {
    name: "Keyboard shortcuts (commands)",
    why: "Save the page, save a selection, highlight, and add a task. These are the shortcuts you see in chrome://extensions/shortcuts.",
  },
];

export default function MonoAgentPrivacyPage() {
  return (
    <div className="bg-ivory">
      <main className="px-6 md:px-12 lg:px-24 py-24 md:py-32 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-dark mb-6 block">Legal</span>
        <h1 className="text-4xl md:text-5xl font-semibold text-espresso tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-sm text-gold-bronze mb-2">MonoAgent and MonoAgent Bridge, by Monoes</p>
        <p className="text-sm text-gold-bronze mb-8">Last updated: October 20, 2026</p>

        <nav aria-label="Sections" className="mb-12 text-sm text-gold-bronze">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a href="#bridge" className={LINK}>MonoAgent Bridge (Chrome extension)</a>
            </li>
            <li>
              <a href="#app" className={LINK}>MonoAgent (desktop app)</a>
            </li>
            <li>
              <a href="#contact" className={LINK}>Contact</a>
            </li>
          </ul>
        </nav>

        <div className="space-y-16 text-gold-bronze leading-relaxed font-light">
          <section>
            <h2 className={H2}>Summary</h2>
            <ul className={LIST}>
              <li>
                MonoAgent runs on your own computer. MonoAgent Bridge is the browser extension that connects your
                browser to it.
              </li>
              <li>
                The extension talks only to the MonoAgent app on your computer. It has no analytics, advertising or
                tracking, and it sends nothing to Monoes.
              </li>
              <li>
                The app needs a monoes.me account and checks for updates, so it does contact monoes.me. It sends no
                usage data, workflow content or page content when it does. Details are in{" "}
                <a href="#app" className={LINK}>the app section</a>.
              </li>
              <li>We don&apos;t sell or rent your data, and we don&apos;t use it for advertising.</li>
            </ul>
          </section>

          <section id="bridge" className="scroll-mt-24">
            <h2 className="text-3xl font-semibold text-espresso mb-8">MonoAgent Bridge (Chrome extension)</h2>

            <div className="space-y-10">
              <div>
                <h3 className={H3}>What it does</h3>
                <p>
                  It connects your own browser to the MonoAgent app on the same computer, so you can save pages,
                  highlights and tasks, ask questions about the page you are reading, record steps, and run your
                  automations in the browser you are already signed in to. It does nothing on its own: it needs the
                  app installed, running and paired with a token you paste once.
                </p>
              </div>

              <div>
                <h3 className={H3}>Data we collect</h3>
                <p>
                  None. The extension has no analytics, advertising or tracking, and it makes no requests to Monoes or
                  any server other than the app on your computer.
                </p>
              </div>

              <div>
                <h3 className={H3}>Data handled on your device</h3>
                <p className="mb-3">
                  When you trigger an action, the extension reads what that action needs and passes it to the MonoAgent
                  app over a connection to 127.0.0.1:
                </p>
                <ul className={LIST}>
                  <li>
                    For a save, highlight, task, recording or chat question: the page text, address and title, and your
                    selection.
                  </li>
                  <li>
                    When you open a page: its address, so the app can return highlights you saved there.
                  </li>
                  <li>
                    For sign-in checks and automations: cookies for the site involved.
                  </li>
                  <li>
                    A recording withholds password, card, one-time-code and similar fields, and removes login codes and
                    tokens from recorded addresses.
                  </li>
                </ul>
                <p className="mt-3">
                  The extension also keeps its settings in browser storage: the pairing token, the connection port, the
                  chosen profile, and saves or tasks waiting until the app is running. Removing the extension deletes
                  them.
                </p>
              </div>

              <div>
                <h3 className={H3}>Data sharing</h3>
                <p>
                  We don&apos;t sell, rent or share this data with anyone. We don&apos;t use it for advertising, credit
                  decisions, or anything unrelated to the extension&apos;s single purpose: connecting your browser to
                  the MonoAgent app on your computer. The use of information received from browser APIs follows the
                  Chrome Web Store User Data Policy, including its Limited Use requirements.
                </p>
              </div>

              <div>
                <h3 className={H3}>Permissions</h3>
                <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                  <table className="w-full text-left text-sm border-collapse">
                    <caption className="sr-only">Permissions MonoAgent Bridge requests and why</caption>
                    <thead>
                      <tr className="border-b border-espresso/20 text-espresso">
                        <th scope="col" className="py-2 pr-4 font-semibold align-top w-2/5">Permission</th>
                        <th scope="col" className="py-2 font-semibold align-top">Why it is needed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSIONS.map((p) => (
                        <tr key={p.name} className="border-b border-espresso/10">
                          <th scope="row" className="py-3 pr-4 font-medium text-espresso align-top">
                            <code className="text-[0.8rem] break-words">{p.name}</code>
                          </th>
                          <td className="py-3 align-top">{p.why}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className={H3}>Remote code</h3>
                <p className="mb-3">
                  The extension loads no code from the internet. All of its own code is bundled in the package.
                </p>
                <p>
                  It does run JavaScript that your own MonoAgent app sends it, for example an automation step that reads
                  a page. That connection is limited to your computer (127.0.0.1) and to an app paired with your token.
                  The extension refuses an unpaired app, and refuses any non-local server unless you allow one for a
                  single save.
                </p>
              </div>

              <div>
                <h3 className={H3}>Third-party services</h3>
                <p>
                  The extension itself contacts none. If you use the chat or summary features, the MonoAgent app sends
                  the text you chose to the AI provider you configured in the app. That is governed by the provider&apos;s
                  terms and your app settings, and is covered under{" "}
                  <a href="#app" className={LINK}>the app section</a>.
                </p>
              </div>

              <div>
                <h3 className={H3}>Your control</h3>
                <ul className={LIST}>
                  <li>Nothing is read or sent until you trigger it: a shortcut, a menu entry, the side panel, a recording or an automation you run.</li>
                  <li>Remove the pairing in the side panel or with <code>monoagentcli extension reset</code>.</li>
                  <li>Remove the extension at any time to stop all activity and delete its stored data.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="app" className="scroll-mt-24">
            <h2 className="text-3xl font-semibold text-espresso mb-8">MonoAgent (desktop app)</h2>

            <div className="space-y-10">
              <div>
                <h3 className={H3}>What it is</h3>
                <p>
                  MonoAgent is a workflow-automation app that runs on your own computer. Your workflows, run history,
                  saved pages, highlights, tasks, CRM data and crash reports stay on your machine, in{" "}
                  <code>~/.monoagent/</code>. Credentials are kept in an encrypted vault. You can delete any of it
                  from the app.
                </p>
              </div>

              <div>
                <h3 className={H3}>Data we collect</h3>
                <p className="mb-3">
                  No analytics, usage counters or device identifiers. MonoAgent doesn&apos;t report what you run, which
                  workflows you have or how often you use it. It makes network requests in these situations only:
                </p>
                <ul className={LIST}>
                  <li>
                    <strong className="text-espresso">Signing in to monoes.me.</strong> A monoes.me account is required.
                    Signing in, staying signed in and signing out send your email address (when you sign in by email
                    code), a sign-in token and the app&apos;s client ID. monoes.me sees which account, when, and the IP
                    address of the request. Nothing else is sent: no workflow content, file paths or page content. Without
                    a connection the app keeps working for 24 hours after the last successful contact.
                  </li>
                  <li>
                    <strong className="text-espresso">The workflow library.</strong> Only when you list, install or
                    publish library items. Publishing uploads the item you choose.
                  </li>
                  <li>
                    <strong className="text-espresso">Updates.</strong> The app checks for a signed release at start and
                    every 24 hours. The server sees your IP address and a default user agent, with no account or device
                    identifier.
                  </li>
                  <li>
                    <strong className="text-espresso">Your own workflows.</strong> Steps you build call the services you
                    configure (HTTP, email, social platforms, AI providers).
                  </li>
                  <li>
                    <strong className="text-espresso">Crash reports.</strong> Written to a local file. They are filed to
                    GitHub only if you set <code>MONOAGENT_CRASH_REPORT=1</code> and have the <code>monomind</code> CLI
                    installed.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className={H3}>AI providers</h3>
                <p>
                  If you use AI features such as chat, summaries or AI workflow steps, the app sends the text you chose to
                  the provider you configured, using your own key or account. That provider&apos;s privacy policy and your
                  settings govern what happens next, not this policy. Pick a provider you trust, or use a local model.
                </p>
              </div>

              <div>
                <h3 className={H3}>Data sharing</h3>
                <p>
                  We don&apos;t sell, rent or share your data, and we don&apos;t use it for advertising. The full list of
                  what the app sends, and how sign-in data is stored on disk, is in the{" "}
                  <a
                    href="https://github.com/monoes/mono-agent/blob/main/SECURITY.md#network-use-telemetry-and-crash-reporting"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK}
                  >
                    Mono Agent security policy
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 className={H3}>Your control</h3>
                <p>
                  Your local data is yours to delete. Sign out from the app to revoke its sign-in. For data tied to your
                  monoes.me account, see the{" "}
                  <Link href="/privacy" className={LINK}>
                    monoes.me Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={H2}>Children</h2>
            <p>MonoAgent and MonoAgent Bridge are not directed at children under 13.</p>
          </section>

          <section>
            <h2 className={H2}>Changes to this policy</h2>
            <p>We&apos;ll update the date at the top and post the changes on this page.</p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className={H2}>Contact</h2>
            <p>
              Questions or requests:{" "}
              <a href="mailto:hello@monoes.me" className={LINK}>
                hello@monoes.me
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
