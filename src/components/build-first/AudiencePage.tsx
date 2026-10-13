import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationForm } from "./ApplicationForm";
import { SpecTable } from "./SpecTable";
import {
  DISCLOSURE,
  OFFER_LINE,
  OFFER_LINE_EQUITY,
  TERMS_PATH,
  type BuildFirstContent,
} from "@/lib/build-first-content";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark";
const rise = "motion-safe:animate-[fadeInUp_0.7s_cubic-bezier(0.16,1,0.3,1)]";

function Terms({ className = "" }: { className?: string }) {
  return (
    <p className={`max-w-xl text-sm ${className}`}>
      {DISCLOSURE}{" "}
      <Link href={TERMS_PATH} className="font-medium underline underline-offset-2">
        Terms apply
      </Link>
      .
    </p>
  );
}

function Hero({ c }: { c: BuildFirstContent }) {
  return (
    <section className="relative bg-espresso px-6 pb-20 pt-32 md:px-16 md:pb-28 md:pt-40 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-8 font-mono text-sm text-gold">Monoes · Build First</p>
        <h1 className={`${rise} mb-8 max-w-4xl text-balance text-[clamp(2.5rem,7vw,4.75rem)] font-semibold leading-[1] tracking-tight text-ivory`}>
          {c.heroLead}
          <br />
          <span className="text-gold">{c.heroAccent}</span>
        </h1>
        <p className="mb-6 max-w-2xl text-lg font-light leading-relaxed text-ivory/80 md:text-xl">{c.heroSub}</p>
        <p className="mb-10 max-w-2xl font-medium text-ivory">
          {c.audience === "startups" ? OFFER_LINE_EQUITY : OFFER_LINE}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#apply" className={`rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-espresso transition-colors hover:bg-gold-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory`}>
            Apply for a build slot →
          </a>
          <a href="#spec" className="rounded-full border border-gold/50 px-7 py-3.5 text-sm font-semibold text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory">
            See what a Spec looks like
          </a>
        </div>
        <Terms className="mt-8 text-ivory/70 [&_a]:text-gold" />
      </div>
    </section>
  );
}

function Steps({ c }: { c: BuildFirstContent }) {
  return (
    <section aria-labelledby="steps-title" className="bg-ivory px-6 py-20 md:px-16 md:py-28 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <h2 id="steps-title" className="mb-14 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-espresso md:text-4xl">
          How the offer works
        </h2>
        <ol className="grid list-none gap-10 p-0 md:grid-cols-3 md:gap-12">
          {c.steps.map((step, i) => (
            <li key={step.title} className={i === 1 ? "md:mt-10" : i === 2 ? "md:mt-20" : ""}>
              <span aria-hidden="true" className="mb-4 block font-mono text-5xl font-medium text-gold-dark">{i + 1}</span>
              <h3 className="mb-3 text-xl font-semibold text-espresso">{step.title}</h3>
              <p className="leading-relaxed text-espresso/80">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SpecSection({ c }: { c: BuildFirstContent }) {
  return (
    <section id="spec" aria-labelledby="spec-title" className="scroll-mt-20 bg-espresso-deep px-6 py-20 md:px-16 md:py-28 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <h2 id="spec-title" className="mb-5 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-ivory md:text-4xl">
          How the Acceptance Spec works
        </h2>
        <p className="mb-10 max-w-2xl leading-relaxed text-ivory/80">{c.specIntro}</p>
        <SpecTable rows={c.specRows} caption={c.specCaption} />
        <ul className="mt-12 grid list-none gap-4 p-0 text-ivory/85 md:grid-cols-2 md:gap-x-12">
          <li>Every row is binary: it passes or it fails. Words like &ldquo;fast&rdquo; or &ldquo;intuitive&rdquo; become a measurable threshold or are left out.</li>
          <li>The Spec is signed by the person who decides, then frozen. The build clock starts from that signature.</li>
          <li>Changes after the freeze are written change requests. They never stretch the build beyond its agreed scope.</li>
          <li>A row fails only with the row ID and the steps that reproduce it. Preferences go to the paid backlog.</li>
        </ul>
      </div>
    </section>
  );
}

function Fit({ c }: { c: BuildFirstContent }) {
  return (
    <section aria-labelledby="fit-title" className="bg-ivory-warm px-6 py-20 md:px-16 md:py-28 lg:px-24">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-20">
        <div>
          <h2 id="fit-title" className="mb-6 text-2xl font-semibold text-espresso md:text-3xl">Who it is for</h2>
          <ul className="grid list-disc gap-3 pl-5 leading-relaxed text-espresso/85">
            {c.forYou.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h2 className="mb-6 text-2xl font-semibold text-espresso md:text-3xl">Who it is not for</h2>
          <ul className="grid list-disc gap-3 pl-5 leading-relaxed text-espresso/85">
            {c.notForYou.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Lines({ c }: { c: BuildFirstContent }) {
  return (
    <section aria-labelledby="lines-title" className="bg-ivory px-6 py-20 md:px-16 md:py-24 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <h2 id="lines-title" className="mb-10 text-3xl font-semibold tracking-tight text-espresso md:text-4xl">What we build</h2>
        <dl className="grid gap-8 md:grid-cols-[12rem_1fr] md:gap-x-12 md:gap-y-8">
          {c.lines.map((line) => (
            <div key={line.id} className="contents">
              <dt className="text-xl font-semibold text-gold-dark">{line.name}</dt>
              <dd className="max-w-xl leading-relaxed text-espresso/85">{line.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Faq({ c }: { c: BuildFirstContent }) {
  return (
    <section aria-labelledby="faq-title" className="bg-ivory-warm px-6 py-20 md:px-16 md:py-28 lg:px-24">
      <div className="mx-auto max-w-3xl">
        <h2 id="faq-title" className="mb-10 text-3xl font-semibold tracking-tight text-espresso md:text-4xl">Questions we expect</h2>
        <div className="divide-y divide-espresso/15 border-y border-espresso/15">
          {c.faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className={`flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-medium text-espresso ${focus}`}>
                {item.q}
                <span aria-hidden="true" className="font-mono text-gold-dark transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-prose leading-relaxed text-espresso/85">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Apply({ c }: { c: BuildFirstContent }) {
  return (
    <section id="apply" aria-labelledby="apply-title" className="scroll-mt-20 bg-ivory px-6 py-20 md:px-16 md:py-28 lg:px-24">
      <div className="mx-auto max-w-3xl">
        <h2 id="apply-title" className="mb-4 text-3xl font-semibold tracking-tight text-espresso md:text-4xl">{c.formTitle}</h2>
        <p className="mb-10 max-w-xl leading-relaxed text-espresso/80">{c.formIntro}</p>
        <ApplicationForm audience={c.audience} />
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section aria-labelledby="trust-title" className="bg-espresso px-6 py-20 md:px-16 md:py-28 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <h2 id="trust-title" className="mb-10 max-w-2xl text-3xl font-semibold tracking-tight text-ivory md:text-4xl">What you can verify today</h2>
        <ul className="grid list-none gap-6 p-0 text-ivory/85 md:grid-cols-3">
          <li>
            <h3 className="mb-2 font-semibold text-gold">Open source</h3>
            <p className="leading-relaxed">
              Our orchestration engine is public:{" "}
              <a className="underline underline-offset-2" href="https://github.com/monoes/monomind">Monomind</a> (Apache 2.0).{" "}
              <a className="underline underline-offset-2" href="https://github.com/monoes/mono-agent">Mono Agent</a> is free to download and run; its source is not public.
            </p>
          </li>
          <li>
            <h3 className="mb-2 font-semibold text-gold">Written terms</h3>
            <p className="leading-relaxed">
              Scope limits, IP, staging rules and the Build Fee are{" "}
              <Link className="underline underline-offset-2" href={TERMS_PATH}>published in full</Link>.
            </p>
          </li>
          <li>
            <h3 className="mb-2 font-semibold text-gold">Who is behind it</h3>
            <p className="leading-relaxed">
              Offered by Nokhodian UG (haftungsbeschränkt), founded by Morteza Nokhodian, author of Monomind.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}

function FinalCta({ c }: { c: BuildFirstContent }) {
  return (
    <section aria-labelledby="final-title" className="bg-espresso-deep px-6 py-24 text-center md:px-16 md:py-32 lg:px-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <h2 id="final-title" className="mb-5 text-balance text-4xl font-semibold tracking-tight text-ivory md:text-5xl">{c.finalHeadline}</h2>
        <p className="mb-10 leading-relaxed text-ivory/80">{c.finalBody}</p>
        <a href="#apply" className="rounded-full bg-gold px-8 py-4 text-sm font-semibold text-espresso transition-colors hover:bg-gold-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory">
          Apply for a build slot →
        </a>
        <Terms className="mt-8 text-ivory/70 [&_a]:text-gold" />
      </div>
    </section>
  );
}

export function audienceMetadata(c: BuildFirstContent): Metadata {
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: c.path },
    openGraph: {
      type: "website",
      url: c.path,
      siteName: "Monoes",
      title: c.metaTitle,
      description: c.metaDescription,
      images: [{ url: "/images/logo-512.png", width: 512, height: 512, alt: "Monoes" }],
    },
    twitter: { card: "summary", title: c.metaTitle, description: c.metaDescription },
  };
}

export function AudiencePage({ content }: { content: BuildFirstContent }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <>
    <main>
      <Hero c={content} />
      <Steps c={content} />
      <SpecSection c={content} />
      <Fit c={content} />
      <Lines c={content} />
      <Faq c={content} />
      <Apply c={content} />
      <Trust />
      <FinalCta c={content} />
    </main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
