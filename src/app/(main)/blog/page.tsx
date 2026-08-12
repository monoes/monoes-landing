import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog & Research - Monoes Autonomous Operations",
  description:
    "Technical articles, agentic architecture deep-dives, and research insights on autonomous workforce orchestration and local-first AI systems.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const featuredPost = posts.find((p) => p.featured) || posts[0];

  return (
    <main className="min-h-screen bg-ivory pt-24 pb-20">
      {/* Header section */}
      <section className="relative px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto mb-16">
        <div className="flex flex-col items-start gap-4 border-b border-ivory-linen pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-pale border border-gold/30 text-xs font-mono tracking-wider text-gold-dark uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-dark animate-pulse" />
            Monoes Journal & Technical Papers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold text-espresso tracking-tight">
            Engineering Autonomous Intelligence
          </h1>

          <p className="max-w-2xl text-lg text-gold-bronze leading-relaxed font-sans">
            Deep dives into multi-agent DAG architectures, zero-trust verification loops, and managed digital worker operations.
          </p>
        </div>
      </section>

      {/* Featured Post Hero Card */}
      {featuredPost && (
        <section className="px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto mb-20">
          <div className="group relative bg-ivory-warm rounded-2xl border border-gold/20 shadow-soft overflow-hidden transition-all duration-300 hover:border-gold/50 hover:shadow-soft-lg grid grid-cols-1 lg:grid-cols-12">
            {/* Image section */}
            <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[320px] overflow-hidden bg-espresso-deep">
              <Image
                src={featuredPost.coverImage.src}
                alt={featuredPost.coverImage.alt}
                fill
                priority
                unoptimized
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-espresso/80 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-md bg-espresso/80 backdrop-blur-md border border-gold/30 text-xs font-mono text-gold uppercase tracking-wider">
                  Featured Deep Dive
                </span>
              </div>
            </div>

            {/* Text content section */}
            <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between bg-ivory-warm">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono text-gold-bronze mb-4">
                  <span>{featuredPost.date}</span>
                  <span>•</span>
                  <span>{featuredPost.readTime}</span>
                </div>

                <Link href={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-2xl lg:text-3xl font-bold text-espresso group-hover:text-gold-dark transition-colors duration-200 leading-snug mb-4">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-gold-bronze text-sm sm:text-base leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded bg-ivory-parchment text-xs font-mono text-espresso border border-ivory-linen"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-ivory-linen">
                  <div className="flex items-center gap-3">
                    <Image
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      width={36}
                      height={36}
                      className="rounded-full border border-gold/40"
                    />
                    <div>
                      <div className="text-xs font-bold text-espresso">
                        {featuredPost.author.name}
                      </div>
                      <div className="text-[11px] text-gold-bronze font-mono">
                        {featuredPost.author.role}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-gold-dark group-hover:translate-x-1 transition-transform duration-200"
                  >
                    Read article <span className="text-base">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid of Regular Posts */}
      <section className="px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <h3 className="text-xl font-mono text-espresso uppercase tracking-wider mb-8 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-gold" />
          Articles & Case Studies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col bg-ivory-warm rounded-xl border border-gold/20 shadow-soft overflow-hidden hover:border-gold/40 hover:shadow-soft-lg transition-all duration-300"
            >
              <div className="relative h-48 bg-espresso-deep overflow-hidden">
                <Image
                  src={post.coverImage.src}
                  alt={post.coverImage.alt}
                  fill
                  unoptimized
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-espresso/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded bg-espresso/80 backdrop-blur-sm text-[11px] font-mono text-gold border border-gold/20">
                    {post.tags[0]}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-gold-bronze mb-2">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h4 className="text-lg font-bold text-espresso group-hover:text-gold-dark transition-colors duration-200 line-clamp-2 leading-snug mb-3">
                      {post.title}
                    </h4>
                  </Link>

                  <p className="text-gold-bronze text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-ivory-linen flex items-center justify-between">
                  <span className="text-xs font-mono text-espresso">
                    By {post.author.name}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-semibold text-gold-dark hover:underline"
                  >
                    Read →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
