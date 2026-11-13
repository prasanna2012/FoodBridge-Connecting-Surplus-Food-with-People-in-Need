import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Heart, Building2, User, Mail, Lock, Phone, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';

export const Register = () => {
  const [role, setRole] = useState('donor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [postalCode, setPostalCode] = useState('');

  // NGO-specific
  const [orgName, setOrgName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [mission, setMission] = useState('');
  const [capacity, setCapacity] = useState(150);
  const [operatingAreas, setOperatingAreas] = useState('Hyderabad Urban & Suburbs');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email,
      password,
      full_name: role === 'ngo' ? (orgName || fullName) : fullName,
      role,
      phone,
      address,
      city,
      state,
      postal_code: postalCode,
      latitude: 17.4156, // default coordinates
      longitude: 78.4487,
    };

    if (role === 'ngo') {
      payload.ngo_profile = {
        organization_name: orgName || fullName,
        registration_number: regNumber,
        mission_statement: mission,
        contact_person: fullName,
        operating_areas: operatingAreas,
        capacity_meals_per_day: parseInt(capacity) || 100,
      };
    }

    try {
      await register(payload);
      // Auto redirect to login with note
      navigate('/login', {
        state: {
          message: role === 'ngo'
            ? 'NGO registration submitted! You can now log in. Note: Admin verification is required before claiming donations.'
            : 'Registration successful! Please sign in.'
        }
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check the entered details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-warm-200 shadow-xl shadow-warm-200/50 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Create Your FoodBridge Account
          </h2>
          <p className="text-xs text-gray-500">
            Join the decentralized network ensuring wholesome surplus food reaches empty plates.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-warm-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'donor'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>Food Donor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('ngo')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'ngo'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Heart className="w-4 h-4 text-teal-600" />
            <span>NGO / Charity</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shared Account Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              1. Basic Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {role === 'donor' ? 'Establishment / Contact Name *' : 'Contact Person Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@domain.com"
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password (min 6 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              2. Pickup & Operational Address
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Building name, street, landmarks"
                className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="500001"
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* NGO Specific Details */}
          {role === 'ngo' && (
            <div className="space-y-4 p-5 bg-teal-50/50 border border-teal-200 rounded-2xl">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
                <Heart className="w-4 h-4 text-teal-600" />
                <span>NGO / Charity Accreditation Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Organization Official Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Annapurna Trust"
                    className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Registration / NGO DARPAN No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. REG-HYD-2021-9988"
                    className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Redistribution Capacity (Meals/Day)
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="150"
                    className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Primary Operational Areas
                  </label>
                  <input
                    type="text"
                    value={operatingAreas}
                    onChange={(e) => setOperatingAreas(e.target.value)}
                    placeholder="e.g. Old City, Secunderabad, Hitech City"
                    className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mission Statement / Brief Overview
                </label>
                <textarea
                  rows={2}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="Describe your regular beneficiaries (e.g. shelter homes, daily wage workers)..."
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>

              <div className="p-3 bg-teal-100/60 rounded-xl text-[11px] text-teal-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> To prevent fraud, our compliance administrators verify all NGO registrations before donation claims can be completed.
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 disabled:opacity-50 transition shadow-md shadow-brand-600/20"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'donor' ? 'Food Donor' : 'NGO / Charity'}`}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

