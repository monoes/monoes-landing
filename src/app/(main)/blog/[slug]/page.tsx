import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "Post Not Found — Monoes Blog",
    };
  }

  return {
    title: `${post.title} — Monoes Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.coverImage.src,
          alt: post.coverImage.alt,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const nextPost = allPosts[(currentIndex + 1) % allPosts.length];

  return (
    <article className="min-h-screen bg-ivory pt-24 pb-24">
      {/* Top Breadcrumb Header */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-gold-bronze mb-6">
          <Link href="/blog" className="hover:text-gold-dark transition-colors">
            BLOG
          </Link>
          <span>/</span>
          <span className="text-espresso truncate">{post.tags[0]}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded bg-gold-pale text-xs font-mono text-gold-dark border border-gold/30 uppercase tracking-wider"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-espresso tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-lg sm:text-xl text-gold-bronze font-sans leading-relaxed mb-8">
          {post.subtitle}
        </p>

        {/* Author & Meta bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-ivory-linen">
          <div className="flex items-center gap-3">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={44}
              height={44}
              className="rounded-full border border-gold/40 shadow-soft"
            />
            <div>
              <div className="text-sm font-bold text-espresso">
                {post.author.name}
              </div>
              <div className="text-xs font-mono text-gold-bronze">
                {post.author.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gold-bronze">
            <div>Published {post.date}</div>
            <span>•</span>
            <div>{post.readTime}</div>
          </div>
        </div>
      </div>

      {/* Main Cover Image */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 mb-14">
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-gold/30 shadow-soft-lg bg-espresso-deep">
          <Image
            src={post.coverImage.src}
            alt={post.coverImage.alt}
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
        </div>
        {post.coverImage.caption && (
          <p className="mt-3 text-center text-xs font-mono text-gold-bronze">
            {post.coverImage.caption}
          </p>
        )}
      </div>

      {/* Article Body Content */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Introduction */}
        <div className="space-y-6 text-base sm:text-lg text-espresso/90 leading-relaxed font-sans border-b border-ivory-linen pb-8">
          {post.content.introduction.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Sections */}
        {post.content.sections.map((section) => (
          <section key={section.id} id={section.id} className="space-y-6 pt-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-espresso tracking-tight">
              {section.heading}
            </h2>

            {section.subheading && (
              <h3 className="text-base font-mono text-gold-dark uppercase tracking-wider font-semibold -mt-2">
                {section.subheading}
              </h3>
            )}

            {section.paragraphs.map((para, idx) => (
              <p
                key={idx}
                className="text-base sm:text-lg text-espresso/90 leading-relaxed"
              >
                {para}
              </p>
            ))}

            {/* Inline Figure / Image if specified */}
            {section.image && (
              <figure className="my-8 space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-gold/30 shadow-soft-lg bg-espresso-deep">
                  <Image
                    src={section.image.src}
                    alt={section.image.alt}
                    fill
                    unoptimized
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="text-center text-xs font-mono text-gold-bronze">
                  {section.image.caption}
                </figcaption>
              </figure>
            )}

            {/* Code Block if specified */}
            {section.codeBlock && (
              <div className="my-6 rounded-xl bg-espresso-deep border border-gold/30 overflow-hidden shadow-soft-lg">
                {section.codeBlock.filename && (
                  <div className="px-4 py-2 bg-espresso border-b border-gold/20 flex items-center justify-between text-xs font-mono text-gold/80">
                    <span>{section.codeBlock.filename}</span>
                    <span className="uppercase text-[10px] text-gold-bronze">
                      {section.codeBlock.language}
                    </span>
                  </div>
                )}
                <pre className="p-4 text-xs sm:text-sm font-mono text-ivory overflow-x-auto leading-relaxed">
                  <code>{section.codeBlock.code}</code>
                </pre>
              </div>
            )}

            {/* Quote if specified */}
            {section.quote && (
              <blockquote className="my-8 p-6 rounded-r-xl bg-ivory-warm border-l-4 border-gold shadow-soft space-y-3">
                <p className="text-lg italic text-espresso font-sans leading-relaxed">
                  &ldquo;{section.quote.text}&rdquo;
                </p>
                {section.quote.author && (
                  <cite className="block text-xs font-mono text-gold-dark not-italic">
                    — {section.quote.author}
                  </cite>
                )}
              </blockquote>
            )}

            {/* Key Takeaways if specified */}
            {section.keyTakeaways && (
              <div className="my-6 p-6 rounded-xl bg-ivory-parchment border border-gold/30 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gold-dark font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gold-dark" />
                  Key Takeaways
                </h4>
                <ul className="space-y-2 text-sm text-espresso">
                  {section.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold-dark font-bold font-mono">✓</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}

        {/* Conclusion */}
        <div className="pt-8 border-t border-ivory-linen space-y-6">
          <h3 className="text-xl font-bold text-espresso font-sans">
            Conclusion & Future Outlook
          </h3>
          {post.content.conclusion.map((paragraph, idx) => (
            <p
              key={idx}
              className="text-base sm:text-lg text-espresso/90 leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Call to action card */}
        <div className="p-8 rounded-2xl bg-espresso-deep border border-gold/40 text-ivory shadow-soft-lg space-y-4">
          <div className="text-xs font-mono text-gold uppercase tracking-wider">
            Ready to Automate Enterprise Workflows?
          </div>
          <h4 className="text-2xl font-bold text-ivory">
            Deploy Monomind Digital Workers Today
          </h4>
          <p className="text-sm text-ivory/80 leading-relaxed">
            Run open-source AI agent teams on your own infrastructure or hire Monoes Workforce to build and audit fully managed operations.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="https://github.com/monoes/monomind"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-gold text-espresso font-semibold text-xs uppercase tracking-wider hover:bg-gold-warm transition-colors"
            >
              Get Monomind on GitHub →
            </Link>
            <Link
              href="/workforce"
              className="px-5 py-2.5 rounded-full border border-gold/40 text-gold font-semibold text-xs uppercase tracking-wider hover:bg-gold/10 transition-colors"
            >
              Explore Workforce Managed Service
            </Link>
          </div>
        </div>

        {/* Next Post Navigation */}
        {nextPost && (
          <div className="pt-12 border-t border-ivory-linen flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <div className="text-xs font-mono text-gold-bronze uppercase">
                Up Next
              </div>
              <Link
                href={`/blog/${nextPost.slug}`}
                className="text-lg font-bold text-espresso hover:text-gold-dark transition-colors line-clamp-1"
              >
                {nextPost.title}
              </Link>
            </div>
            <Link
              href={`/blog/${nextPost.slug}`}
              className="px-4 py-2 rounded-full border border-gold/30 text-xs font-mono text-gold-dark hover:bg-gold-pale transition-colors whitespace-nowrap"
            >
              Read Next Article →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
