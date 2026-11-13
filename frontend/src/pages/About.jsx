import React from 'react';
import { 
  ShieldCheck, 
  Utensils, 
  HeartHandshake, 
  Scale, 
  AlertTriangle, 
  ThermometerSnowflake, 
  CheckCircle2,
  Award
} from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* 1. Header */}
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-widest font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Our Purpose & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Nourishing Communities Through <br />
          <span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">
            Transparent Food Redistribution
          </span>
        </h1>
        <p className="text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
          FoodBridge was created to solve a tragic contradiction: millions of tons of wholesome prepared food are dumped into landfills daily, while millions of families go to bed hungry.
        </p>
      </div>

      {/* 2. Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Zero Waste</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Redirecting surplus food from hospitality, corporate dining, and retail to eliminate unnecessary greenhouse gas emissions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Zero Hunger</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Partnering with trusted, verified NGOs and community kitchens to feed shelter residents, child care centers, and families in need.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Safety & Trust</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Enforcing strict food storage parameters, allergen disclosure, and two-way verification for every single batch handed over.
          </p>
        </div>
      </div>

      {/* 3. Safety Charter */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-warm-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-100 text-brand-700 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Food Safety & Hygiene Charter</h2>
            <p className="text-xs text-gray-500">Requirements enforced on all food donations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-warm-50 border border-warm-200">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-gray-900 font-semibold mb-0.5">Mandatory Preparation Time & Expiry:</strong>
              Donors must provide truthful cooking or packaging timestamps. Listings past their use-by deadline are automatically closed.
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-warm-50 border border-warm-200">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-gray-900 font-semibold mb-0.5">Clear Allergen Warnings:</strong>
              Common allergens (dairy, nuts, gluten, eggs, soy) must be selected during donation creation.
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-warm-50 border border-warm-200">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-gray-900 font-semibold mb-0.5">Thermal Preservation:</strong>
              Hot cooked foods must remain in hot holding (above 60°C) and dairy/produce must remain chilled (below 5°C).
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-warm-50 border border-warm-200">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-gray-900 font-semibold mb-0.5">Two-Factor OTP Handover:</strong>
              NGO volunteers verify a 6-digit OTP upon physical inspection before taking custody of the food.
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3.5 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Platform Disclaimer: </strong>
            FoodBridge provides software coordination infrastructure only and does not inspect, test, or certify the hygiene or freshness of food donations. Receiving NGOs have the full right and duty to inspect items at pickup and reject any batches that do not meet food safety standards.
          </div>
        </div>
      </div>

      {/* 4. Good Samaritan Act */}
      <div id="good-samaritan" className="bg-warm-100 rounded-3xl p-8 sm:p-10 border border-warm-200 space-y-4">
        <div className="flex items-center gap-3">
          <Scale className="w-6 h-6 text-brand-700" />
          <h2 className="text-xl font-bold text-gray-900">Good Samaritan Food Donation Protection</h2>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">
          Under national and regional Food Safety Regulations and Good Samaritan laws, donors who provide wholesome surplus food in good faith to registered charity organizations without payment are protected from liability. This ensures hospitality and retail establishments can donate excess food with confidence rather than discarding it.
        </p>
      </div>
    </div>
  );
};

export default About;

