/**
 * Inline SVG icon library — Lucide-style, MIT paths
 * No external dependency needed.
 */
import React from 'react';

const Svg = ({ size = 24, strokeWidth = 2, className = '', style = {}, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {children}
  </svg>
);

/* ── Navigation / UI ─────────────────────────────── */
export const CalendarIcon = (p) => (
  <Svg {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </Svg>
);

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </Svg>
);

export const BarChartIcon = (p) => (
  <Svg {...p}>
    <line x1="18" x2="18" y1="20" y2="10"/>
    <line x1="12" x2="12" y1="20" y2="4"/>
    <line x1="6" x2="6" y1="20" y2="14"/>
  </Svg>
);

export const MapPinIcon = (p) => (
  <Svg {...p}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </Svg>
);

export const FolderOpenIcon = (p) => (
  <Svg {...p}>
    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/>
  </Svg>
);

export const BellIcon = (p) => (
  <Svg {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5"/>
  </Svg>
);

export const AlertTriangleIcon = (p) => (
  <Svg {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <line x1="12" x2="12.01" y1="17" y2="17"/>
  </Svg>
);

export const CameraIcon = (p) => (
  <Svg {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </Svg>
);

export const MessageSquareIcon = (p) => (
  <Svg {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </Svg>
);

export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect width="14" height="14" x="8" y="8" rx="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </Svg>
);

export const BellOffIcon = (p) => (
  <Svg {...p}>
    <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/>
    <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </Svg>
);

/* ── Crime Category Icons ─────────────────────────── */
export const TheftIcon = (p) => (
  <Svg {...p}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" x2="21" y1="6" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </Svg>
);

export const AssaultIcon = (p) => (
  <Svg {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <line x1="12" x2="12.01" y1="17" y2="17"/>
  </Svg>
);

export const BurglaryIcon = (p) => (
  <Svg {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </Svg>
);

export const RobberyIcon = (p) => (
  <Svg {...p}>
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
    <path d="M12 8v4"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </Svg>
);

export const VandalismIcon = (p) => (
  <Svg {...p}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </Svg>
);

export const DrugIcon = (p) => (
  <Svg {...p}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
    <path d="m8.5 8.5 7 7"/>
  </Svg>
);

export const FraudIcon = (p) => (
  <Svg {...p}>
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </Svg>
);

export const WeaponIcon = (p) => (
  <Svg {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    <path d="m9 12 2 2 4-4"/>
  </Svg>
);

export const TrespassIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10"/>
    <path d="m4.9 4.9 14.2 14.2"/>
  </Svg>
);

export const VehicleIcon = (p) => (
  <Svg {...p}>
    <rect width="18" height="8" x="3" y="10" rx="2"/>
    <path d="M5 10 7.5 5h9L19 10"/>
    <circle cx="8" cy="18" r="2"/>
    <circle cx="16" cy="18" r="2"/>
  </Svg>
);

export const DefaultCrimeIcon = (p) => (
  <Svg {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" x2="8" y1="13" y2="13"/>
    <line x1="16" x2="8" y1="17" y2="17"/>
  </Svg>
);

export const SexualOffenseIcon = (p) => (
  <Svg {...p}>
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </Svg>
);
