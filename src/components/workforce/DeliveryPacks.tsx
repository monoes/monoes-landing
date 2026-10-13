import { deliveryPacks } from "@/lib/workforce";

export function DeliveryPacks() {
  return (
    <section
      id="delivery"
      aria-labelledby="delivery-title"
      className="bg-ivory px-8 md:px-16 lg:px-24 py-24 md:py-28 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-14 max-w-2xl">
          <h2 id="delivery-title" className="text-3xl md:text-4xl font-semibold text-espresso tracking-tight mb-5 text-balance">
            Exactly what you receive.
          </h2>
          <p className="text-espresso/75 leading-relaxed">
            Each Discovery ends with a delivery pack. Delivery means these documents and automations are handed over to
            you. The invoice follows delivery.
          </p>
        </div>
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {deliveryPacks.map((pack) => (
            <div key={pack.id}>
              <h3 className="text-xl font-semibold text-espresso mb-2">{pack.name}</h3>
              <p className="text-espresso/75 mb-6 leading-relaxed">{pack.summary}</p>
              <dl className="divide-y divide-espresso/15 border-y border-espresso/15">
                {pack.items.map((item) => (
                  <div key={item.title} className="py-4">
                    <dt className="font-medium text-espresso mb-1">{item.title}</dt>
                    <dd className="text-sm text-espresso/75 leading-relaxed">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
