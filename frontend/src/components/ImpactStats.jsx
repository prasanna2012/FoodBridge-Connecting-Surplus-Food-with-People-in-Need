import React from 'react';
import { Utensils, Scale, CloudOff, Building2, Users, Award } from 'lucide-react';

export const ImpactStats = ({ stats, loading = false }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-warm-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Wholesome Meals Saved',
      value: stats.total_meals_saved?.toLocaleString() || '0',
      icon: Utensils,
      color: 'text-brand-600',
      bg: 'bg-brand-50 border-brand-200',
      desc: 'Nutritious meals served to people in need',
    },
    {
      label: 'Food Waste Diverted',
      value: `${stats.total_kg_diverted?.toLocaleString() || '0'} kg`,
      icon: Scale,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-200',
      desc: 'Kept away from city landfills',
    },
    {
      label: 'CO2 Emissions Offset',
      value: `${stats.estimated_co2_offset_kg?.toLocaleString() || '0'} kg`,
      icon: CloudOff,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      desc: 'Greenhouse gases mitigated',
    },
    {
      label: 'Active Donors & NGOs',
      value: `${(stats.total_donors || 0) + (stats.total_ngos || 0)}`,
      icon: Users,
      color: 'text-warm-700',
      bg: 'bg-warm-100 border-warm-200',
      desc: 'Verified partner network',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`p-6 rounded-2xl border ${item.bg} bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {item.label}
              </span>
              <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {item.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImpactStats;

