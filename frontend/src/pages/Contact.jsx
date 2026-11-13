import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Donor',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Support & Regional Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
          We Are Here to Connect You
        </h1>
        <p className="text-sm text-gray-600 max-w-xl mx-auto">
          Have surplus food to clear urgently? Need assistance registering your NGO? Our redistribution support team is available 24/7.
        </p>
      </div>

      {/* Emergency Surplus Hotline Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
            <AlertCircle className="w-4 h-4" /> Emergency Large-Surplus Hotline
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">Have 100+ servings needing rescue within 2 hours?</h3>
          <p className="text-xs text-brand-100">
            Our dispatch coordinator will route immediate volunteer vans in your area.
          </p>
        </div>
        <a
          href="tel:18003663274"
          className="px-6 py-3.5 bg-white text-brand-900 rounded-2xl font-bold text-sm shadow-md hover:bg-warm-100 transition flex items-center gap-2 flex-shrink-0"
        >
          <Phone className="w-4 h-4 text-brand-700" />
          Call 1800-FOOD-BRIDGE
        </a>
      </div>

      {/* Grid: Contact Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900">FoodBridge Headquarters</h3>

            <div className="space-y-4 text-xs text-gray-600">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 text-brand-700 rounded-xl flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-gray-900 font-semibold mb-0.5">Physical Address</strong>
                  FoodBridge Regional Logistics Center, Floor 4, Cyber Towers Road, Hitech City, Hyderabad 500081
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-gray-900 font-semibold mb-0.5">Email Support</strong>
                  helpdesk@foodbridge.org<br />
                  partnerships@foodbridge.org
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-gray-900 font-semibold mb-0.5">Direct Line</strong>
                  +91 (040) 2468-FOOD (8 AM - 10 PM IST)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-warm-100 rounded-3xl p-6 border border-warm-200 text-xs text-gray-600">
            <h4 className="font-bold text-gray-900 mb-1">Are you an NGO needing onboarding help?</h4>
            <p>
              Send your organization registration certificate to <span className="font-semibold text-brand-700">verify@foodbridge.org</span> for expedited approval.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Send Us a Message</h3>
            <p className="text-xs text-gray-500 mb-6">
              Fill out the inquiry form below and our team will get back to you within 24 hours.
            </p>

            {submitted ? (
              <div className="p-8 text-center bg-brand-50 rounded-2xl border border-brand-200 space-y-2">
                <CheckCircle className="w-10 h-10 text-brand-600 mx-auto" />
                <h4 className="font-bold text-gray-900">Message Received!</h4>
                <p className="text-xs text-gray-600">
                  Thank you for reaching out. A platform coordinator has received your request and will follow up shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-xs font-semibold text-brand-700 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ramesh@hotel.com"
                      className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      I am a...
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                    >
                      <option value="Donor">Food Donor (Hotel / Restaurant / Supermarket)</option>
                      <option value="NGO">NGO / Charity Volunteer</option>
                      <option value="Volunteer">Individual Community Volunteer</option>
                      <option value="Media">Media / Partnership Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Regular banquet food donation arrangement"
                    className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your query or donation details..."
                    className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition flex items-center justify-center gap-2 shadow"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

