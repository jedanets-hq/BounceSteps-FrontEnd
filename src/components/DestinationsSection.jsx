import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import TrendingServices from "./TrendingServices";

const DestinationsSection = () => {
  const scrollRef = useRef(null);
  const storiesScrollRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [active, setActive] = useState(1);
  const [destinations, setDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [travelerStories, setTravelerStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [providerServices, setProviderServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const autoScrollInterval = useRef(null);

  // Check if user is a service provider
  const isProvider = isAuthenticated && user?.userType === 'service_provider';

  // Fetch popular destinations from API
  useEffect(() => {
    if (!isProvider) {
      const fetchPopularDestinations = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${API_URL}/services/destinations/popular?limit=6`);
          const data = await response.json();
          
          console.log('Popular destinations API response:', data);
          
          if (data.success && data.destinations.length > 0) {
            setDestinations(data.destinations);
          } else {
            // Fallback to default destinations if no real data
            setDestinations([
              { name: "Arusha", desc: "Gateway to Northern Safari Circuit", img: "/ARUSHA.png" },
              { name: "Zanzibar", desc: "Exotic beaches and spice tours", img: "/ZANZIBAR.png" },
              { name: "Dar es Salaam", desc: "Commercial hub with coastal attractions", img: "/DARESSAALAM.png" },
              { name: "Mwanza", desc: "Rock city by Lake Victoria", img: "/MWANZA.png" }
            ]);
          }
        } catch (error) {
          console.error('Error fetching popular destinations:', error);
          // Fallback to default destinations
          setDestinations([
            { name: "Arusha", desc: "Gateway to Northern Safari Circuit", img: "/ARUSHA.png" },
            { name: "Zanzibar", desc: "Exotic beaches and spice tours", img: "/ZANZIBAR.png" },
            { name: "Dar es Salaam", desc: "Commercial hub with coastal attractions", img: "/DARESSAALAM.png" },
            { name: "Mwanza", desc: "Rock city by Lake Victoria", img: "/MWANZA.png" }
          ]);
        } finally {
          setDestinationsLoading(false);
        }
      };

      fetchPopularDestinations();
    } else {
      setDestinationsLoading(false);
    }
  }, [isProvider]);

  // Fetch provider services for service providers
  useEffect(() => {
    if (isProvider && user?.id) {
      const fetchProviderServices = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${API_URL}/services/provider/my-services`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          const data = await response.json();
          
          console.log('Provider services API response:', data);
          
          if (data.success && data.services.length > 0) {
            // Show all services, not just top-rated ones
            setProviderServices(data.services);
          }
        } catch (error) {
          console.error('Error fetching provider services:', error);
        } finally {
          setServicesLoading(false);
        }
      };

      fetchProviderServices();
    } else {
      setServicesLoading(false);
    }
  }, [isProvider, user]);

  // Fetch approved traveler stories
  useEffect(() => {
    const fetchTravelerStories = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/traveler-stories/`);
        const data = await response.json();
        
        console.log('Traveler stories API response:', data); // Debug log
        
        if (data.success) {
          setTravelerStories(data.stories.slice(0, 6)); // Show only first 6 stories
        } else {
          console.error('API returned error:', data.message);
        }
      } catch (error) {
        console.error('Error fetching traveler stories:', error);
      } finally {
        setStoriesLoading(false);
      }
    };

    fetchTravelerStories();
  }, []);

  const scroll = (dir) => {
    const scrollAmount = window.innerWidth < 768 ? 180 : 400; // Smaller scroll for mobile
    scrollRef.current?.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
    setActive((p) => Math.max(0, Math.min(destinations.length - 1, p + dir)));
  };

  const handleDestinationClick = (destination) => {
    console.log('🔍 Destination clicked:', destination);
    // Navigate to destination discovery with region filter to show all services in that area
    const searchParams = new URLSearchParams();
    if (destination.name) {
      searchParams.append('region', destination.name);
      console.log('🔍 Navigating with region:', destination.name);
    }
    const url = `/destination-discovery?${searchParams.toString()}`;
    console.log('🔍 Navigation URL:', url);
    navigate(url);
  };

  // Auto-scroll for mobile stories carousel
  useEffect(() => {
    if (travelerStories.length > 1 && !isUserInteracting) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentStoryIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % travelerStories.length;
          
          // Auto-scroll the mobile carousel
          if (storiesScrollRef.current) {
            const cardWidth = 320; // w-80 = 320px + gap
            const scrollPosition = nextIndex * cardWidth;
            storiesScrollRef.current.scrollTo({
              left: scrollPosition,
              behavior: 'smooth'
            });
          }
          
          return nextIndex;
        });
      }, 4000); // Change slide every 4 seconds

      return () => {
        if (autoScrollInterval.current) {
          clearInterval(autoScrollInterval.current);
        }
      };
    }
  }, [travelerStories.length, isUserInteracting]);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, []);

  // Handle user interaction
  const handleUserInteraction = () => {
    setIsUserInteracting(true);
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
    
    // Resume auto-scroll after 10 seconds of no interaction
    setTimeout(() => {
      setIsUserInteracting(false);
    }, 10000);
  };

  // Update current index based on scroll position
  const handleScroll = (e) => {
    handleUserInteraction();
    
    const scrollLeft = e.target.scrollLeft;
    const cardWidth = 320; // w-80 = 320px + gap
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    if (newIndex !== currentStoryIndex && newIndex >= 0 && newIndex < travelerStories.length) {
      setCurrentStoryIndex(newIndex);
    }
  };

  return (
    <section id="destinations" className="py-16 relative overflow-hidden">
      {/* Beach fade background */}
      <div className="absolute inset-0">
        <img
          src="/beach-bg-fade.jpg"
          alt=""
          className="w-full h-full object-cover opacity-25"
          loading="lazy"
          width={1920}
          height={800}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      </div>

      {/* Tropical leaves - decorative (mobile + desktop) */}
      <img
        src="/leaves-left.png"
        alt=""
        className="absolute left-0 bottom-0 h-[40%] w-[120px] md:w-[180px] object-cover object-right opacity-20 md:opacity-25 pointer-events-none"
        loading="lazy"
        width={512}
        height={800}
      />
      <img
        src="/leaves-right.png"
        alt=""
        className="absolute right-0 top-1/3 h-[40%] w-[120px] md:w-[180px] object-cover object-left opacity-20 md:opacity-25 pointer-events-none"
        loading="lazy"
        width={512}
        height={800}
      />

      <div className="w-full px-4 text-center relative z-10">
        <div className="max-w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {isProvider ? "My Services" : "Popular Destinations"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isProvider ? "Your services and offerings for travelers" : "Discover the world's top travel spots"}
        </p>

        <div className="relative mt-10 max-w-7xl mx-auto">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {(isProvider ? servicesLoading : destinationsLoading) ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide justify-start pl-4 md:pl-6 pr-4 md:pr-6 snap-x pb-4"
              style={{ scrollbarWidth: "none" }}
            >
              {isProvider ? (
                // Provider Services
                providerServices.length > 0 ? (
                  providerServices.map((service, index) => (
                    <div
                      key={`${service.id}-${index}`}
                      onClick={() => navigate(`/service-provider-dashboard?tab=services&serviceId=${service.id}`)}
                      className={`flex-shrink-0 w-[160px] md:w-[380px] rounded-2xl overflow-hidden shadow-lg bg-background/90 backdrop-blur-sm group cursor-pointer snap-start hover:shadow-xl transition-all duration-300 ${
                        index === providerServices.length - 1 ? 'mr-8' : ''
                      }`}
                    >
                      <div className="h-40 md:h-56 overflow-hidden">
                        <img
                          src={service.images?.[0] || '/default-service.jpg'}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          width={640}
                          height={512}
                          onError={(e) => {
                            e.target.src = '/default-service.jpg';
                          }}
                        />
                      </div>
                      <div className="p-4 text-left">
                        <h3 className="font-bold text-foreground text-base md:text-lg line-clamp-1">{service.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="text-sm font-semibold ml-1">{service.rating || 'New'}</span>
                          </div>
                          <span className="text-sm font-bold text-primary">${service.price}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/service-provider-dashboard?tab=services&serviceId=${service.id}`);
                          }}
                          className="mt-3 bg-primary text-primary-foreground px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-accent transition-colors w-full md:w-auto"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-shrink-0 w-full text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground mb-4">No services created yet</p>
                    <button 
                      onClick={() => navigate('/service-provider-dashboard?tab=services&action=add')}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-accent transition-colors"
                    >
                      Add Your First Service
                    </button>
                  </div>
                )
              ) : (
                // Traveler Destinations
                destinations.map((d, index) => (
                  <div
                    key={`${d.name}-${index}`}
                    onClick={() => handleDestinationClick(d)}
                    className={`flex-shrink-0 w-[160px] md:w-[380px] rounded-2xl overflow-hidden shadow-lg bg-background/90 backdrop-blur-sm group cursor-pointer snap-start hover:shadow-xl transition-all duration-300 ${
                      index === destinations.length - 1 ? 'mr-8' : ''
                    }`}
                  >
                    <div className="h-40 md:h-56 overflow-hidden">
                      <img
                        src={d.img}
                        alt={d.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        width={640}
                        height={512}
                        onError={(e) => {
                          e.target.src = '/default-destination.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4 text-left">
                      <h3 className="font-bold text-foreground text-base md:text-lg">{d.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.desc}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDestinationClick(d);
                        }}
                        className="mt-3 bg-primary text-primary-foreground px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-accent transition-colors w-full md:w-auto"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dots */}
        {!destinationsLoading && destinations.length > 0 && !isProvider && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {destinations.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === active ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}

        {/* View All Button for Provider Services */}
        {isProvider && providerServices.length > 6 && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => navigate('/service-provider-dashboard?tab=services')}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              View All Services
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Top Ranking Services Section */}
      <TrendingServices />

      {/* Space for future content */}
      <div className="py-8"></div>

      {/* Trending Services Section - Placeholder */}
      <section className="py-16 relative bg-gradient-to-b from-background/50 to-background">
        <div className="w-full px-4 text-center relative z-10">
          <div className="max-w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Trending Services
            </h2>
            <p className="text-muted-foreground mb-10">
              Discover what's trending in travel services
            </p>
            {/* Placeholder content */}
            <div className="max-w-4xl mx-auto p-12 bg-card border border-border rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-muted-foreground">
                Trending services based on bookings and popularity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Section - Only show for travelers */}
      {!isProvider && (
        <section className="py-16 relative bg-gradient-to-b from-background to-background/50">
          <div className="w-full px-4 text-center relative z-10">
            <div className="max-w-full">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Recommendations
              </h2>
              <p className="text-muted-foreground mb-10">
                Personalized recommendations just for you
              </p>
              {/* Placeholder content */}
              <div className="max-w-4xl mx-auto p-12 bg-card border border-border rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="text-muted-foreground">
                  Personalized service recommendations based on your preferences
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How BounceSteps Works Section */}
      <div className="w-full px-4 text-center relative z-10 mt-20">
        <div className="max-w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isProvider ? "How to Grow Your Business" : "How BounceSteps Works"}
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            {isProvider 
              ? "Build your service business and connect with travelers through our platform"
              : "From inspiration to memories, we guide you through every step of your journey with intelligent technology and human expertise."
            }
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {isProvider ? (
              // Provider Steps
              <>
                {/* Create Services */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Create Services</h3>
                  <p className="text-sm text-muted-foreground">
                    List your travel services with detailed descriptions, photos, and competitive pricing.
                  </p>
                </div>

                {/* Manage Bookings */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Manage Bookings</h3>
                  <p className="text-sm text-muted-foreground">
                    Handle reservations, communicate with travelers, and manage your schedule efficiently.
                  </p>
                </div>

                {/* Build Reputation */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Build Reputation</h3>
                  <p className="text-sm text-muted-foreground">
                    Deliver excellent service to earn positive reviews and build trust with travelers.
                  </p>
                </div>

                {/* Grow Revenue */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Grow Revenue</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your performance, optimize pricing, and scale your business with analytics insights.
                  </p>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <span className="mr-2">✓</span>
                      <span>Performance analytics</span>
                    </div>
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <span className="mr-2">✓</span>
                      <span>Revenue tracking</span>
                    </div>
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <span className="mr-2">✓</span>
                      <span>Marketing tools</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Traveler Steps
              <>
                {/* Discover */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Discover</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore curated destinations with AI-powered recommendations tailored to
                    your preferences and travel style.
                  </p>
                </div>

                {/* Plan */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Build your perfect itinerary with our intelligent trip builder and expert
                    concierge support.
                  </p>
                </div>

                {/* Experience */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Enjoy seamless travel with 24/7 support, exclusive access, and authentic local
                    experiences.
                  </p>
                </div>

                {/* Share */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Share</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture memories and inspire others by sharing your journey with our global travel
                    community.
                  </p>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <span className="mr-2">✓</span>
                      <span>Photo galleries</span>
                    </div>
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <span className="mr-2">✓</span>
                      <span>Travel stories</span>
                    </div>
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <span className="mr-2">✓</span>
                      <span>Community rewards</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Traveler Stories Section */}
      <div className="w-full px-4 text-center relative z-10 mt-20">
        <div className="max-w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Traveler Stories
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Real experiences from real travelers who discovered the world through
            BounceSteps
          </p>

          {storiesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : travelerStories.length > 0 ? (
            <>
              {/* Desktop View - Grid: Mobile 2 columns, Desktop 3 columns */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {travelerStories.map((story) => {
                  // Parse images
                  let storyImages = [];
                  try {
                    storyImages = story.images ? (typeof story.images === 'string' ? JSON.parse(story.images) : story.images) : [];
                  } catch (e) {
                    storyImages = [];
                  }

                  return (
                    <div
                      key={story.id}
                      className="bg-background/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-border group hover:shadow-xl transition-all duration-300"
                    >
                      {/* Story Images */}
                      {storyImages.length > 0 && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={storyImages[0]}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {storyImages.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              +{storyImages.length - 1}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-6">
                        {/* Author Info */}
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            {story.profile_image ? (
                              <img
                                src={story.profile_image}
                                alt={`${story.first_name} ${story.last_name}`}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-primary font-semibold text-sm">
                                {story.first_name?.charAt(0)}{story.last_name?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-foreground text-sm">
                              {story.first_name} {story.last_name}
                            </h4>
                            {story.location && (
                              <p className="text-xs text-muted-foreground">
                                📍 {story.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Story Content */}
                        <h3 className="font-bold text-foreground mb-3 text-left line-clamp-2">
                          {story.title}
                        </h3>
                        <p className="text-sm text-muted-foreground text-left line-clamp-4 mb-4">
                          {story.story}
                        </p>

                        {/* Story Meta */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {new Date(story.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {story.likes_count > 0 && (
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              {story.likes_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile View - Carousel */}
              <div className="md:hidden relative">
                {/* Navigation Arrows for Mobile */}
                {travelerStories.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        const newIndex = currentStoryIndex > 0 ? currentStoryIndex - 1 : travelerStories.length - 1;
                        setCurrentStoryIndex(newIndex);
                        if (storiesScrollRef.current) {
                          const cardWidth = 320;
                          storiesScrollRef.current.scrollTo({
                            left: newIndex * cardWidth,
                            behavior: 'smooth'
                          });
                        }
                        handleUserInteraction();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <button
                      onClick={() => {
                        const newIndex = currentStoryIndex < travelerStories.length - 1 ? currentStoryIndex + 1 : 0;
                        setCurrentStoryIndex(newIndex);
                        if (storiesScrollRef.current) {
                          const cardWidth = 320;
                          storiesScrollRef.current.scrollTo({
                            left: newIndex * cardWidth,
                            behavior: 'smooth'
                          });
                        }
                        handleUserInteraction();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                <div 
                  ref={storiesScrollRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory pb-4"
                  style={{ 
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                  onTouchStart={handleUserInteraction}
                  onMouseDown={handleUserInteraction}
                  onScroll={handleScroll}
                >
                  {travelerStories.map((story, index) => {
                    // Parse images
                    let storyImages = [];
                    try {
                      storyImages = story.images ? (typeof story.images === 'string' ? JSON.parse(story.images) : story.images) : [];
                    } catch (e) {
                      storyImages = [];
                    }

                    return (
                      <div
                        key={story.id}
                        className="flex-shrink-0 w-80 bg-background/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-border snap-start"
                      >
                        {/* Story Images */}
                        {storyImages.length > 0 && (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={storyImages[0]}
                              alt={story.title}
                              className="w-full h-full object-cover"
                            />
                            {storyImages.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                +{storyImages.length - 1}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-6">
                          {/* Author Info */}
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              {story.profile_image ? (
                                <img
                                  src={story.profile_image}
                                  alt={`${story.first_name} ${story.last_name}`}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-primary font-semibold text-sm">
                                  {story.first_name?.charAt(0)}{story.last_name?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-foreground text-sm">
                                {story.first_name} {story.last_name}
                              </h4>
                              {story.location && (
                                <p className="text-xs text-muted-foreground">
                                  📍 {story.location}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Story Content */}
                          <h3 className="font-bold text-foreground mb-3 text-left line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-sm text-muted-foreground text-left line-clamp-4 mb-4">
                            {story.story}
                          </p>

                          {/* Story Meta */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {new Date(story.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            {story.likes_count > 0 && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                {story.likes_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Mobile Carousel Indicators */}
                {travelerStories.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {travelerStories.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStoryIndex ? "bg-primary" : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-muted-foreground">
                No traveler stories available yet. Be the first to share your adventure!
              </p>
            </div>
          )}

          {travelerStories.length > 0 && (
            <div className="mt-8">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors">
                View All Stories
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
