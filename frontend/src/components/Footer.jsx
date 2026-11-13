import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Heart, ShieldAlert, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-warm-900 text-warm-100 pt-16 pb-12 border-t border-warm-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-warm-800">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">FoodBridge</span>
            </div>
            <p className="text-xs text-warm-300 leading-relaxed">
              Bridging the gap between food surplus and community hunger. Connecting generous donors with verified NGOs to rescue wholesome meals with transparency and safety.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <Heart className="w-4 h-4 fill-brand-400" />
              <span>Nourishing communities together</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-warm-300">
              <li>
                <Link to="/donations" className="hover:text-brand-400 transition">
                  Browse Food Donations
                </Link>
              </li>
              <li>
                <Link to="/donations/add" className="hover:text-brand-400 transition">
                  Donate Surplus Food
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition">
                  Safety Standards & Guidelines
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition">
                  NGO Verification Process
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Transparency
            </h4>
            <ul className="space-y-2.5 text-xs text-warm-300">
              <li>
                <Link to="/about#good-samaritan" className="hover:text-brand-400 transition">
                  Good Samaritan Food Protections
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-400 transition">
                  Help Center & Support
                </Link>
              </li>
              <li>
                <Link to="/contact#report" className="hover:text-brand-400 transition">
                  Report a Safety Concern
                </Link>
              </li>
              <li>
                <span className="text-warm-400">Emergency Food Waste Helpline: 1800-FOOD-BRIDGE</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Headquarters
            </h4>
            <ul className="space-y-3 text-xs text-warm-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>FoodBridge Operations Center, Hitech City, Hyderabad, 500081</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>+91 (040) 2468-FOOD</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>redistribution@foodbridge.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Real-World Safety Disclaimer Box */}
        <div className="mt-8 bg-warm-950/60 border border-warm-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-warm-300 leading-relaxed">
            <strong className="text-white font-semibold">Important Safety & Legal Notice: </strong>
            FoodBridge provides a software discovery and redistribution coordination platform connecting donors with independent registered non-profit organizations. FoodBridge does not directly inspect, handle, test, or certify the hygiene or safety of any donated food products. Donors must provide truthful preparation details, temperature requirements, and allergen disclosures, and NGOs are responsible for physical inspection prior to collection and distribution.
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-warm-400 gap-4">
          <p>© {new Date().getFullYear()} FoodBridge Platform Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Food Hygiene Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

