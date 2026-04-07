import Icon from "./AppIcon";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const services = [
  { icon: "Home", title: "Accommodation", desc: "Best stays at great prices", categoryId: "Accommodation" },
  { icon: "Car", title: "Transportation", desc: "Comfortable local transport", categoryId: "Transportation" },
  { icon: "Compass", title: "Tours & Activities", desc: "Guided tours and adventures", categoryId: "Tours & Activities" },
  { icon: "Utensils", title: "Food & Dining", desc: "Local cuisine experiences", categoryId: "Food & Dining" },
  { icon: "ShoppingBag", title: "Shopping", desc: "Local markets & crafts", categoryId: "Shopping" },
  { icon: "Heart", title: "Health & Wellness", desc: "Wellness and spa services", categoryId: "Health & Wellness" },
];

const ServicesSection = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (dir) => {
    const scrollAmount = window.innerWidth < 768 ? 120 : 220; // Smaller scroll for mobile
    scrollRef.current?.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
  };

  const handleServiceClick = (service) => {
    // Navigate to destination discovery with the specific category selected
    navigate(`/destination-discovery?category=${encodeURIComponent(service.categoryId)}`);
  };

  return (
    <section id="services" className="py-16 relative overflow-hidden">
      {/* Beach fade background */}
      <div className="absolute inset-0">
        <img
          src="/beach-bg-fade.jpg"
          alt=""
          className="w-full h-full object-cover opacity-30"
          loading="lazy"
          width={1920}
          height={800}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
      </div>

      <div className="w-full px-4 text-center relative z-10">
        <div className="max-w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Quick & Easy Travel Services
        </h2>
        <p className="text-muted-foreground mt-2">
          Discover the world's top travel spots
        </p>

        <div className="relative mt-10 max-w-7xl mx-auto">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background dark:bg-gray-800 shadow-md flex items-center justify-center text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <Icon name="ChevronLeft" size={18} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide justify-start pl-6 pr-8 snap-x"
            style={{ scrollbarWidth: "none" }}
          >
            {services.map((s) => (
              <div
                key={s.title}
                onClick={() => handleServiceClick(s)}
                className="flex-shrink-0 w-[110px] md:w-[200px] bg-background/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-6 flex flex-col items-center gap-2 md:gap-4 hover:shadow-lg transition-all cursor-pointer snap-start shadow-sm hover:scale-105 hover:bg-background dark:hover:bg-gray-800"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-secondary dark:bg-gray-700 flex items-center justify-center">
                  <Icon name={s.icon} size={24} className="text-primary dark:text-primary md:w-8 md:h-8" />
                </div>
                <h3 className="font-semibold text-foreground dark:text-white text-xs md:text-base">{s.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-300 leading-tight text-center">{s.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background dark:bg-gray-800 shadow-md flex items-center justify-center text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <Icon name="ChevronRight" size={18} />
          </button>
        </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
