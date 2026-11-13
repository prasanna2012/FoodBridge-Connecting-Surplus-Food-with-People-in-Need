import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  Upload, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckSquare, 
  Image as ImageIcon,
  Flame,
  ThermometerSnowflake,
  Box
} from 'lucide-react';
import { donationsApi } from '../api/client';
import LeafletMap from '../components/LeafletMap';

const ALLERGEN_OPTIONS = ['Dairy', 'Nuts', 'Gluten', 'Eggs', 'Soy', 'Shellfish', 'None'];

export const AddDonation = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('cooked_meals');
  const [quantityValue, setQuantityValue] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('servings');

  // Dates
  const nowStr = new Date().toISOString().slice(0, 16);
  const defaultExpiryStr = new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 16);

  const [prepTime, setPrepTime] = useState(nowStr);
  const [expiryDeadline, setExpiryDeadline] = useState(defaultExpiryStr);

  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [lat, setLat] = useState(17.4156);
  const [lng, setLng] = useState(78.4487);

  const [storage, setStorage] = useState('ambient');
  const [selectedAllergens, setSelectedAllergens] = useState(['None']);
  const [safetyAgreed, setSafetyAgreed] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAllergenToggle = (item) => {
    if (item === 'None') {
      setSelectedAllergens(['None']);
      return;
    }
    const filtered = selectedAllergens.filter((a) => a !== 'None');
    if (filtered.includes(item)) {
      const next = filtered.filter((a) => a !== item);
      setSelectedAllergens(next.length === 0 ? ['None'] : next);
    } else {
      setSelectedAllergens([...filtered, item]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!safetyAgreed) {
      setError('You must confirm the food safety and accurate declaration before publishing.');
      return;
    }

    const expiryDate = new Date(expiryDeadline);
    if (expiryDate <= new Date()) {
      setError('Expiry / use-by deadline must be in the future.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        food_category: category,
        quantity_value: parseFloat(quantityValue),
        quantity_unit: quantityUnit,
        preparation_time: prepTime ? new Date(prepTime).toISOString() : null,
        expiry_deadline: expiryDate.toISOString(),
        pickup_address: pickupAddress,
        pickup_instructions: pickupInstructions,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        storage_condition: storage,
        allergens: selectedAllergens.join(', '),
        safety_declaration_accepted: true,
      };

      const res = await donationsApi.create(payload);
      const createdId = res.data.id;

      // Upload image if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
          await donationsApi.uploadImage(createdId, formData);
        } catch (imgErr) {
          console.warn('Image upload error:', imgErr);
        }
      }

      navigate(`/donations/${createdId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to publish food donation. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-warm-200 shadow-xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Donor Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Create Food Donation Listing
          </h1>
          <p className="text-xs text-gray-500">
            Provide transparent information to help nearby NGOs safely transport and redistribute this food.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Food Overview */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-warm-100">
              1. Food Details & Quantity
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Food Title / Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Catered Lunch Buffet - Rice, Paneer Gravy, Rotis"
                className="w-full p-3 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Food Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  <option value="cooked_meals">Cooked Meals</option>
                  <option value="catered_buffet">Catered Buffet</option>
                  <option value="bakery">Bakery & Bread</option>
                  <option value="produce_fruits_vegetables">Produce / Fruits & Veg</option>
                  <option value="dairy">Dairy Products</option>
                  <option value="packaged_groceries">Packaged Groceries</option>
                  <option value="beverages">Beverages</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity Amount *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0.1"
                  value={quantityValue}
                  onChange={(e) => setQuantityValue(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity Unit *
                </label>
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  <option value="servings">Servings (Meals)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="boxes">Boxes / Crates</option>
                  <option value="packets">Packets / Units</option>
                  <option value="liters">Liters</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Detailed Description & Packaging State
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention items included, container types (thermal foil, sealed boxes), dietary flags..."
                className="w-full p-3 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Safety, Timings & Storage */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-warm-100">
              2. Safety Parameters & Timestamps
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Preparation / Cooked Time
                </label>
                <input
                  type="datetime-local"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Expiry / Use-By Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={expiryDeadline}
                  onChange={(e) => setExpiryDeadline(e.target.value)}
                  className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Storage Condition *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'ambient', label: 'Ambient Room Temp', icon: Box },
                  { id: 'refrigerated', label: 'Refrigerated (<5°C)', icon: ThermometerSnowflake },
                  { id: 'frozen', label: 'Frozen (< -18°C)', icon: ThermometerSnowflake },
                  { id: 'hot_holding', label: 'Hot Holding (>60°C)', icon: Flame },
                ].map((cond) => {
                  const Icon = cond.icon;
                  const isSelected = storage === cond.id;
                  return (
                    <button
                      type="button"
                      key={cond.id}
                      onClick={() => setStorage(cond.id)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-20 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/70 text-brand-900 font-bold'
                          : 'border-warm-200 bg-warm-50 text-gray-600 hover:bg-warm-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-gray-400'}`} />
                      <span className="text-[11px] leading-tight">{cond.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Food Allergens (Check all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((item) => {
                  const active = selectedAllergens.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleAllergenToggle(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                        active
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                          : 'bg-white border-warm-200 text-gray-600 hover:bg-warm-50'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Pickup Location & Map Pin */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-warm-100">
              3. Pickup Location & OpenStreetMap Pin
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pickup Address *
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="e.g. Grand Horizon Hotel, Road 1 Banjara Hills, Hyderabad"
                className="w-full p-3 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pickup Instructions
              </label>
              <input
                type="text"
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                placeholder="e.g. Kitchen dispatch loading bay, ask for Duty Chef Ramesh."
                className="w-full p-2.5 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1.5">
                Pin Location on OpenStreetMap (Click to adjust pin)
              </span>
              <LeafletMap
                height="220px"
                singlePoint={[lat, lng]}
                onLocationSelect={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
              <div className="mt-1 text-[11px] text-gray-500 font-mono">
                Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
              </div>
            </div>
          </div>

          {/* Section 4: Photograph Upload */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-warm-100">
              4. Food Photograph (Recommended)
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl border border-dashed border-warm-300 bg-warm-50">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-24 object-cover rounded-xl border border-warm-200"
                />
              ) : (
                <div className="w-32 h-24 rounded-xl bg-warm-200/60 flex items-center justify-center text-warm-500">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-1 text-center sm:text-left">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-warm-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-warm-100 transition shadow-sm">
                  <Upload className="w-4 h-4 text-brand-600" />
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-500">
                  Upload a clear photo of the packed food containers (JPG, PNG, WebP)
                </p>
              </div>
            </div>
          </div>

          {/* Mandatory Safety Agreement */}
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl flex items-start gap-3">
            <input
              type="checkbox"
              id="safetyAgree"
              checked={safetyAgreed}
              onChange={(e) => setSafetyAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
            />
            <label htmlFor="safetyAgree" className="text-xs text-brand-900 leading-relaxed cursor-pointer">
              <strong className="block font-bold">Food Hygiene & Honesty Declaration:</strong>
              I certify that this food was prepared following standard food safety hygiene practices, has been stored under the indicated temperature condition, and all allergen information is accurate to the best of my knowledge.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl text-xs font-bold hover:bg-brand-700 disabled:opacity-50 transition shadow-lg shadow-brand-600/20"
          >
            {loading ? 'Publishing Listing...' : 'Publish Food Donation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDonation;

