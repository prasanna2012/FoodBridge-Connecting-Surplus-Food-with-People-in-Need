import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ThermometerSnowflake, 
  Flame, 
  Box, 
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const CATEGORY_NAMES = {
  cooked_meals: 'Cooked Meals',
  bakery: 'Bakery & Bread',
  produce_fruits_vegetables: 'Fresh Produce',
  dairy: 'Dairy Products',
  packaged_groceries: 'Packaged Food',
  beverages: 'Beverages',
  catered_buffet: 'Catered Buffet',
  other: 'Other Food',
};

const CATEGORY_FALLBACK_IMAGES = {
  cooked_meals: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  produce_fruits_vegetables: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80',
  dairy: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=600&auto=format&fit=crop&q=80',
  packaged_groceries: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=600&auto=format&fit=crop&q=80',
  beverages: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  catered_buffet: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  other: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
};

export const DonationCard = ({ donation, onRequest }) => {
  const {
    id,
    title,
    food_category,
    quantity_value,
    quantity_unit,
    expiry_deadline,
    pickup_address,
    storage_condition,
    allergens,
    image_url,
    status,
    donor,
  } = donation;

  // Calculate hours remaining
  const now = new Date();
  const expiry = new Date(expiry_deadline);
  const diffHours = (expiry - now) / (1000 * 60 * 60);

  const getStorageBadge = () => {
    switch (storage_condition) {
      case 'refrigerated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
            <ThermometerSnowflake className="w-3 h-3" /> Chilled
          </span>
        );
      case 'frozen':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            <ThermometerSnowflake className="w-3 h-3" /> Frozen
          </span>
        );
      case 'hot_holding':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Flame className="w-3 h-3" /> Hot Holding
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <Box className="w-3 h-3" /> Ambient
          </span>
        );
    }
  };

  const getExpiryLabel = () => {
    if (diffHours <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
          <Clock className="w-3.5 h-3.5" /> Expired
        </span>
      );
    }
    if (diffHours < 3) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 animate-pulse">
          <Clock className="w-3.5 h-3.5" /> Urgent: {Math.round(diffHours * 60)} mins left
        </span>
      );
    }
    if (diffHours < 8) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          <Clock className="w-3.5 h-3.5" /> {Math.round(diffHours)} hours left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
        <Clock className="w-3.5 h-3.5" /> Use by {expiry.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </span>
    );
  };

  const displayImage = image_url
    ? (image_url.startsWith('http') ? image_url : `http://127.0.0.1:8000${image_url}`)
    : CATEGORY_FALLBACK_IMAGES[food_category] || CATEGORY_FALLBACK_IMAGES.other;

  return (
    <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
      {/* Top Media / Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-warm-100">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = CATEGORY_FALLBACK_IMAGES.other;
          }}
        />
        {/* Category tag */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-xs font-medium">
            {CATEGORY_NAMES[food_category] || food_category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Quantity Banner Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-sm border border-warm-200 flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Layers className="w-3.5 h-3.5 text-brand-600" />
          <span>{Number(quantity_value)} {quantity_unit}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Urgency & Storage Condition row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            {getExpiryLabel()}
            {getStorageBadge()}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition">
            <Link to={`/donations/${id}`}>{title}</Link>
          </h3>

          {/* Donor Name & Location */}
          <div className="mt-2 space-y-1.5 text-xs text-gray-600">
            {donor && (
              <div className="flex items-center gap-1.5 font-medium text-gray-800">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span className="truncate">{donor.full_name}</span>
                {donor.is_verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" title="Verified Donor" />
                )}
              </div>
            )}
            <div className="flex items-start gap-1.5 text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-warm-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{pickup_address}</span>
            </div>
          </div>

          {/* Allergens warning */}
          {allergens && allergens.toLowerCase() !== 'none' && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1">
              <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="truncate">Allergens: {allergens}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-warm-100 flex items-center justify-between gap-2">
          <Link
            to={`/donations/${id}`}
            className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 py-1.5 px-2 hover:bg-brand-50 rounded-lg transition"
          >
            Details & Safety <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {status === 'available' && onRequest && (
            <button
              onClick={() => onRequest(donation)}
              className="px-3.5 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 shadow-sm transition"
            >
              Claim Food
            </button>
          )}

          {['accepted', 'ready_for_pickup'].includes(status) && (
            <Link
              to={`/tracking/${id}`}
              className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold hover:bg-purple-100 transition"
            >
              Track Pickup
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationCard;

