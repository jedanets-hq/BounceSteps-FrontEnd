import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ServicesPreview = () => {
  const [hoveredService, setHoveredService] = useState(null);

  const services = [
    {
      id: 1,
      title: "Flight Booking",
      description: "Premium flight booking with exclusive airline partnerships and 24/7 support",
      icon: "Plane",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["Best price guarantee", "Flexible booking", "Priority support"],
      stats: "50K+ flights booked",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "Luxury Accommodations",
      description: "Curated selection of premium hotels, resorts, and unique stays worldwide",
      icon: "Building",
      image: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800",
      features: ["Luxury properties", "Exclusive rates", "VIP amenities"],
      stats: "10K+ properties",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: 3,
      title: "Cultural Experiences",
      description: "Authentic local experiences and guided tours with expert cultural guides",
      icon: "Users",
      image: "https://images.pixabay.com/photo/2017/08/06/12/06/people-2591874_1280.jpg",
      features: ["Local experts", "Authentic experiences", "Small groups"],
      stats: "1K+ experiences",
      color: "from-green-500 to-green-600"
    },
    {
      id: 4,
      title: "Visa Support",
      description: "Complete visa and documentation assistance for hassle-free international travel",
      icon: "FileText",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      features: ["Document assistance", "Fast processing", "Expert guidance"],
      stats: "95% success rate",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-medium text-foreground mb-6">
            Comprehensive Travel Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            From flights to cultural immersion, we provide everything you need for 
            an extraordinary travel experience through our global network.
          </p>
          <Link to="/services-overview">
            <Button variant="outline" size="lg">
              <Icon name="ArrowRight" size={20} />
              View All Services
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services?.map((service) => (
            <div
              key={service?.id}
              className="group relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredService(service?.id)}
              onMouseLeave={() => setHoveredService(null)}
              onClick={() => window.location.href = '/service-booking?category=' + encodeURIComponent(service?.category || 'all')}
            >
              {/* Service Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={service?.image}
                  alt={service?.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${service?.color} opacity-80`}></div>
                
                {/* Service Icon */}
                <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Icon name={service?.icon} size={24} className="text-white" />
                </div>

                {/* Stats Badge */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {service?.stats}
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                  {service?.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {service?.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {service?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Icon name="Check" size={14} className="text-primary mr-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Action */}
                <div className={`transition-all duration-300 ${
                  hoveredService === service?.id 
                    ? 'opacity-100 translate-y-0' :'opacity-0 translate-y-2'
                }`}>
                  <Button variant="ghost" size="sm" fullWidth>
                    <Icon name="ArrowRight" size={16} />
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Service Ecosystem Overview */}
        <div className="mt-20 bg-muted/30 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display font-medium text-foreground mb-4">
              Complete Travel Ecosystem
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All services work together seamlessly to create your perfect journey
            </p>
          </div>

          {/* Service Flow */}
          <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-8">
            {/* Planning */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Icon name="Calendar" size={24} className="text-primary-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Plan</h4>
              <p className="text-sm text-muted-foreground">AI-powered itinerary building</p>
            </div>

            <Icon name="ArrowRight" size={24} className="text-muted-foreground hidden lg:block" />
            <Icon name="ArrowDown" size={24} className="text-muted-foreground lg:hidden" />

            {/* Booking */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Icon name="CreditCard" size={24} className="text-secondary-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Book</h4>
              <p className="text-sm text-muted-foreground">Secure payment & confirmation</p>
            </div>

            <Icon name="ArrowRight" size={24} className="text-muted-foreground hidden lg:block" />
            <Icon name="ArrowDown" size={24} className="text-muted-foreground lg:hidden" />

            {/* Experience */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                <Icon name="MapPin" size={24} className="text-accent-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Experience</h4>
              <p className="text-sm text-muted-foreground">24/7 support & local guidance</p>
            </div>

            <Icon name="ArrowRight" size={24} className="text-muted-foreground hidden lg:block" />
            <Icon name="ArrowDown" size={24} className="text-muted-foreground lg:hidden" />

            {/* Share */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
                <Icon name="Share2" size={24} className="text-success-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Share</h4>
              <p className="text-sm text-muted-foreground">Memories & recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;