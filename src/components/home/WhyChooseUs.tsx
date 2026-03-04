import { Shield, Zap, Headphones } from "lucide-react";

export function WhyChooseUs() {
  return (
    <section className="bg-[#F8FAFC] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#0F172A" }}>
            Why Choose Us
          </h2>
          <p className="mt-3 text-base md:text-lg" style={{ color: "#64748B" }}>
            Reliable products, expert support, and fast delivery you can trust.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(249,115,22,0.12)" }}>
              <Shield className="h-5 w-5" style={{ color: "#F97316" }} />
            </div>
            <h3 className="text-lg font-semibold mb-1.5" style={{ color: "#0F172A" }}>
              Genuine Products
            </h3>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Quality-assured items from trusted manufacturers.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(249,115,22,0.12)" }}>
              <Zap className="h-5 w-5" style={{ color: "#F97316" }} />
            </div>
            <h3 className="text-lg font-semibold mb-1.5" style={{ color: "#0F172A" }}>
              Fast Delivery
            </h3>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Quick, reliable delivery across Lagos and beyond.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(249,115,22,0.12)" }}>
              <Headphones className="h-5 w-5" style={{ color: "#F97316" }} />
            </div>
            <h3 className="text-lg font-semibold mb-1.5" style={{ color: "#0F172A" }}>
              Expert Support
            </h3>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Helpful guidance before and after your purchase.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

