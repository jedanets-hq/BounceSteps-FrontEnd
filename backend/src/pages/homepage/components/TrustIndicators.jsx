import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { API_URL } from '../../../utils/api';

const TrustIndicators = () => {
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrustedPartners();
  }, []);

  const fetchTrustedPartners = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/trusted-partners`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.partners && data.partners.length > 0) {
          setPartnerships(data.partners);
        }
      }
    } catch (err) {
      console.error('Error fetching trusted partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const certifications = [
    {
      id: 1,
      name: "IATA Certified",
      icon: "Shield",
      description: "International Air Transport Association certified travel agent"
    },
    {
      id: 2,
      name: "ISO 27001",
      icon: "Lock",
      description: "Information security management system certified"
    },
    {
      id: 3,
      name: "PCI DSS",
      icon: "CreditCard",
      description: "Payment Card Industry Data Security Standard compliant"
    },
    {
      id: 4,
      name: "24/7 Support",
      icon: "Headphones",
      description: "Round-the-clock customer support in multiple time zones"
    }
  ];

  const awards = [
    {
      id: 1,
      title: "Best Travel Platform 2024",
      organization: "World Travel Awards",
      year: "2024"
    },
    {
      id: 2,
      title: "Excellence in Customer Service",
      organization: "Travel Industry Association",
      year: "2024"
    },
    {
      id: 3,
      title: "Innovation in Travel Technology",
      organization: "Global Travel Tech Awards",
      year: "2023"
    }
  ];

  const supportZones = [
    { zone: "Americas", hours: "24/7", languages: "EN, ES, PT" },
    { zone: "Europe & Africa", hours: "24/7", languages: "EN, FR, DE, IT" },
    { zone: "Asia Pacific", hours: "24/7", languages: "EN, JA, ZH, KO" },
    { zone: "Middle East", hours: "24/7", languages: "EN, AR, FA" }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/20 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-foreground mb-4 sm:mb-6">
            Trusted by Travelers Worldwide
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Connecting travelers with authentic experiences across the globe
          </p>
        </div>

        {/* Partnership Logos - Only show if there are partners */}
        {partnerships.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <h3 className="text-xl sm:text-2xl font-semibold text-center text-foreground mb-6 sm:mb-8">
              Trusted Partners
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {partnerships?.map((partner) => (
                <div
                  key={partner?.id}
                  className="bg-card rounded-lg p-4 sm:p-6 border border-border hover:shadow-md transition-shadow duration-200 text-center"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={partner?.logo}
                      alt={partner?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium text-card-foreground text-xs sm:text-sm mb-1">
                    {partner?.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{partner?.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Statistics */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
          <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">99.9%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Uptime Guarantee</div>
          </div>
          <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">50K+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Satisfied Travelers</div>
          </div>
          <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">4.9/5</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">150+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Countries Covered</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;