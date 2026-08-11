import { CountUp } from "@/components/ui/CountUp";

export function StatsBar({ totalStars }: { totalStars: number }) {
  return (
    <section className="bg-ivory px-8 py-12">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-0">
        <div className="text-center md:border-r md:border-ivory-linen">
          <CountUp end={4} className="block text-3xl font-extralight text-espresso" />
          <p className="mt-1 text-[10px] uppercase tracking-label text-gold">Projects</p>
        </div>
        <div className="text-center md:border-r md:border-ivory-linen">
          <CountUp end={3} className="block text-3xl font-extralight text-espresso" />
          <p className="mt-1 text-[10px] uppercase tracking-label text-gold">Languages</p>
        </div>
        <div className="text-center md:border-r md:border-ivory-linen">
          <CountUp end={totalStars} suffix="+" className="block text-3xl font-extralight text-espresso" />
          <p className="mt-1 text-[10px] uppercase tracking-label text-gold">GitHub Stars</p>
        </div>
        <div className="text-center">
          <span className="block text-2xl font-extralight text-espresso md:text-3xl">Apache-2.0</span>
          <p className="mt-1 text-[10px] uppercase tracking-label text-gold">License</p>
        </div>
      </div>
    </section>
  );
}
