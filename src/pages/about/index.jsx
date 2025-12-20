import React from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';

const About = () => {
  const partners = [
    {
      name: 'JOCTAN MFUNGO',
      role: 'Chief Executive Officer (CEO)',
      image: 'https://ui-avatars.com/api/?name=Joctan+Mfungo&background=0ea5e9&color=fff'
    },
    {
      name: 'ELIZABETH ERNEST',
      role: 'Chief Technology Officer (CTO)',
      image: 'https://ui-avatars.com/api/?name=Elizabeth+Ernest&background=0ea5e9&color=fff'
    },
    {
      name: 'DANFORD MWANKENJA',
      role: 'Chief Operating Officer (COO)',
      image: 'https://ui-avatars.com/api/?name=Danford+Mwankenja&background=0ea5e9&color=fff'
    },
    {
      name: 'ASTERIA MOMBO',
      role: 'Chief Financial Officer (CFO)',
      image: 'https://ui-avatars.com/api/?name=Asteria+Mombo&background=0ea5e9&color=fff'
    }
  ];

  // Page title is now "About iSafari Global"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-display font-medium text-foreground mb-6">
              About iSafari Global
            </h1>
            {/* Title updated to "About iSafari Global" */}
            <h2 className="text-2xl md:text-3xl font-display text-primary mb-4">
              Powered by JEDA NETWORKS
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Developed and owned by JEDA NETWORKS, transforming the travel industry through 
              innovative technology and authentic cultural experiences.
            </p>
            <div className="bg-card rounded-2xl shadow-warm p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Building" size={32} className="text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-semibold text-foreground">JEDA NETWORKS</h2>
                  <p className="text-muted-foreground">Innovation in Travel Technology</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JEDA NETWORKS Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-6">
                Powered by JEDA NETWORKS
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                JEDA NETWORKS is a technology company specializing in innovative solutions 
                for the travel and tourism industry. Our mission is to connect travelers 
                with authentic experiences while empowering local service providers.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-6">Our Vision</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="Target" size={20} className="text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Innovation</h4>
                      <p className="text-muted-foreground text-sm">
                        Leveraging cutting-edge technology to revolutionize travel planning and booking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Users" size={20} className="text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Community</h4>
                      <p className="text-muted-foreground text-sm">
                        Building bridges between travelers and local communities worldwide
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Globe" size={20} className="text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Global Impact</h4>
                      <p className="text-muted-foreground text-sm">
                        Creating sustainable tourism that benefits both travelers and destinations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-2xl shadow-warm p-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Academic Partnership</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Globe" size={24} className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">GLOBAL TECHNOLOGY INNOVATION</h4>
                    <p className="text-muted-foreground text-sm">Cutting-edge travel technology solutions</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  This project is developed in collaboration with MUST (COICT), combining 
                  academic excellence with practical innovation to create solutions that 
                  address real-world challenges in the travel industry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-6">
                Meet Our Partners
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                The visionary team behind JEDA NETWORKS, bringing together diverse expertise 
                in technology, business, and innovation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {partners.map((partner, index) => (
                <div key={index} className="bg-card rounded-2xl shadow-warm p-6 text-center hover:shadow-soft transition-all duration-300">
                  <div className="relative mb-6">
                    <Image
                      src={partner.image}
                      alt={partner.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="Star" size={16} className="text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{partner.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{partner.role}</p>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Icon name="Mail" size={14} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="Linkedin" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology & Innovation */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-6">
                Technology & Innovation
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Built with modern technologies and innovative approaches to deliver 
                exceptional user experiences and robust functionality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-2xl shadow-warm p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Code" size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Modern Development</h3>
                <p className="text-muted-foreground">
                  Built with React, modern JavaScript, and cutting-edge web technologies 
                  for optimal performance and user experience.
                </p>
              </div>

              <div className="bg-card rounded-2xl shadow-warm p-8 text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Shield" size={32} className="text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Security First</h3>
                <p className="text-muted-foreground">
                  Implementing industry-standard security practices to protect user data 
                  and ensure safe transactions and interactions.
                </p>
              </div>

              <div className="bg-card rounded-2xl shadow-warm p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Zap" size={32} className="text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Performance</h3>
                <p className="text-muted-foreground">
                  Optimized for speed and efficiency, ensuring fast loading times 
                  and smooth interactions across all devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-6">
              Get in Touch with JEDA NETWORKS
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              We leverage cutting-edge technology and innovation to deliver world-class travel solutions 
              that connect travelers with authentic African experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Icon name="Mail" size={20} />
                Contact Us
              </Button>
              <Button variant="outline" size="lg">
                <Icon name="Building" size={20} />
                Partnership Opportunities
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">JEDA NETWORKS</h3>
            <p className="text-background/80 text-sm">
              Innovating the future of travel technology
            </p>
          </div>
          <div className="border-t border-background/20 pt-6">
            <p className="text-background/60 text-sm">
              © {new Date().getFullYear()} JEDA NETWORKS. All rights reserved.
            </p>
            <p className="text-background/50 text-xs mt-1">
              Innovative Travel Technology Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
