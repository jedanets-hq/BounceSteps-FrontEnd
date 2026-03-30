"use client";

import React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PlayStoreButton } from "@/components/ui/play-store-button";
import { AppStoreButton } from "@/components/ui/app-store-button";

const footerLinks = [
  {
    title: "COMMUNITY",
    links: [
      { href: "/about", label: "About BounceSteps" },
      { href: "/stories", label: "Traveler Stories" },
      { href: "/partners", label: "Service Provider Portal" },
      { href: "/blog", label: "Travel Blog" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookie-policy", label: "Cookie Policy" },
    ],
  },
  {
    title: "DISCOVER",
    links: [
      { href: "/destination-discovery", label: "Destinations" },
      { href: "/journey-planner", label: "AI Journey Planner" },
      { href: "/trending", label: "Trending Experiences" },
      { href: "/local-guides", label: "Local Guides" },
    ],
  },
  {
    title: "SUPPORT",
    links: [
      { href: "/help", label: "Help Center" },
      { href: "/concierge", label: "24/7 Concierge" },
      { href: "/safety", label: "Safety Resources" },
      { href: "/faq", label: "FAQs" },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/bouncesteps" },
  { icon: Instagram, href: "https://instagram.com/bouncesteps" },
  { icon: Linkedin, href: "https://linkedin.com/company/bouncesteps" },
  { icon: Twitter, href: "https://twitter.com/bouncesteps" },
];

export function Footer2() {
  return (
    <footer className="w-full max-w-none px-0 bg-foreground text-background border-t border-background/10 pt-16 pb-8">
      <div className="w-full px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Column - Wider */}
          <div className="lg:col-span-2 text-left">
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src="/bouncesteps-logo.png" 
                alt="BounceSteps" 
                className="h-10 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span className="font-display font-medium text-xl">BounceSteps</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed mb-8 max-w-sm">
              Transforming travel through authentic cultural experiences and intelligent planning.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-background/80 group">
                <div className="w-8 h-8 rounded-full bg-background/5 flex items-center justify-center group-hover:bg-background/10 transition-colors">
                  <MapPin size={16} className="text-background/60" />
                </div>
                <span>Dar es Salaam, Tanzania</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-background/80 group">
                <div className="w-8 h-8 rounded-full bg-background/5 flex items-center justify-center group-hover:bg-background/10 transition-colors">
                  <Mail size={16} className="text-background/60" />
                </div>
                <span>hello@bouncesteps.com</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((item, i) => (
            <div key={i} className="text-left">
              <h3 className="font-bold text-background mb-6 text-sm tracking-[0.2em]">
                {item.title}
              </h3>
              <ul className="space-y-4 text-background/60 text-sm">
                {item.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="block py-2 md:py-0 hover:text-background hover:pl-1 transition-all">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px bg-background/10 mb-10" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* App Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <AppStoreButton className="rounded-xl border border-background/20 h-12" />
            <PlayStoreButton className="rounded-xl border border-background/20 h-12" />
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 items-center">
            {socialLinks.map(({ icon: Icon, href }, i) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-background/5 border border-background/10 text-background/60 hover:bg-background/10 hover:text-background hover:border-background/30 transition-all"
                key={i}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/5 text-center">
          <p className="text-background/30 text-xs">
            © {new Date().getFullYear()} BounceSteps. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
