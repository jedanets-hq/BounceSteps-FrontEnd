import { CheckCircle, Tag, Globe, Headphones } from "lucide-react";

const benefits = [
  { icon: CheckCircle, label: "Easy Booking" },
  { icon: Tag, label: "Best Prices" },
  { icon: Globe, label: "All-in-One Platform" },
  { icon: Headphones, label: "24/7 Support" },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Beach background with fade */}
      <div className="absolute inset-0">
        <img
          src="/beach-bg-fade.jpg"
          alt=""
          className="w-full h-full object-cover opacity-40"
          loading="lazy"
          width={1920}
          height={800}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* Tropical leaves - left side only (faded, far back) */}
      <img
        src="/leaves-left.png"
        alt=""
        className="absolute left-0 top-0 h-full w-[180px] md:w-[220px] object-cover object-right opacity-30 pointer-events-none"
        loading="lazy"
        width={512}
        height={800}
      />

      <div className="w-full px-4 relative z-10 content-padding">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10 max-w-7xl mx-auto">
          {/* Left: Why Choose Us */}
          <div className="flex-1 max-w-md w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8 text-center lg:text-left">
              Why Choose Us
            </h2>
            <ul className="space-y-4 md:space-y-5">
              {benefits.map((b) => (
                <li key={b.label} className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <b.icon className="text-primary" size={20} />
                  </div>
                  <span className="font-semibold text-foreground text-sm md:text-base">{b.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Center: Phone mockup */}
          <div className="flex-1 flex justify-center max-w-sm order-first lg:order-none">
            <img
              src="/phones-mockup.png"
              alt="App mockup"
              className="w-[240px] md:w-[280px] lg:w-[320px] drop-shadow-2xl"
              loading="lazy"
              width={640}
              height={640}
            />
          </div>

          {/* Right: Newsletter */}
          <div className="flex-1 max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 text-center lg:text-left">
              Get travel deals &<br />updates
            </h3>
            <div className="flex flex-col gap-3 max-w-sm mx-auto lg:mx-0">
              <input
                type="email"
                placeholder="Enter your email address..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm md:text-base"
              />
              <button className="bg-primary text-primary-foreground px-6 md:px-8 py-3 rounded-xl font-semibold hover:bg-accent transition-colors text-sm md:text-base">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
