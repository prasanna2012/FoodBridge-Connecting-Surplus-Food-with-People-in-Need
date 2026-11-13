import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PackageCheck, 
  Truck, 
  XCircle, 
  Ban, 
  TimerReset 
} from 'lucide-react';

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
  },
  requested: {
    label: 'Requested',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
    dot: 'bg-blue-500',
  },
  accepted: {
    label: 'Accepted',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: PackageCheck,
    dot: 'bg-purple-500',
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Truck,
    dot: 'bg-amber-500 animate-pulse',
  },
  collected: {
    label: 'Collected',
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: PackageCheck,
    dot: 'bg-teal-500',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-green-50 text-green-800 border-green-300',
    icon: CheckCircle2,
    dot: 'bg-green-600',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
    dot: 'bg-rose-500',
  },
  expired: {
    label: 'Expired',
    bg: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: TimerReset,
    dot: 'bg-gray-400',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    icon: Ban,
    dot: 'bg-zinc-400',
  },
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status ? status.replace('_', ' ') : 'Unknown',
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: AlertCircle,
    dot: 'bg-gray-400',
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses} capitalize transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;

