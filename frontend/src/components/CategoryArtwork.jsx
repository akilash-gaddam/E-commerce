import React from 'react';

/**
 * Category Artwork Component
 * Renders crisp editorial geometric/botanical SVG artwork for each product category
 * when image_url is blank, ensuring every product card looks intentional and cohesive.
 */
const categoryArtworks = {
  Produce: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="produceGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#143628" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#143628" stopOpacity="0.05"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#produceGrad)"/>
      {/* Leaf cluster */}
      <g stroke="#143628" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Main stem */}
        <path d="M60 90 Q60 70 50 55 Q45 45 55 35 Q65 25 75 35 Q80 42 75 55 Q70 68 60 90" fill="#143628" fillOpacity="0.12" stroke="#143628" strokeWidth="1"/>
        {/* Leaves */}
        <ellipse cx="45" cy="50" rx="12" ry="6" transform="rotate(-30 45 50)" fill="#143628" fillOpacity="0.18"/>
        <ellipse cx="75" cy="48" rx="10" ry="5" transform="rotate(25 75 48)" fill="#143628" fillOpacity="0.18"/>
        <ellipse cx="55" cy="32" rx="9" ry="4.5" transform="rotate(-10 55 32)" fill="#143628" fillOpacity="0.2"/>
        {/* Leaf veins */}
        <path d="M45 50 Q40 42 35 36" stroke="#143628" strokeWidth="0.8" strokeOpacity="0.5"/>
        <path d="M45 50 Q50 42 55 38" stroke="#143628" strokeWidth="0.8" strokeOpacity="0.5"/>
        <path d="M75 48 Q80 40 84 35" stroke="#143628" strokeWidth="0.8" strokeOpacity="0.5"/>
        <path d="M75 48 Q70 40 66 36" stroke="#143628" strokeWidth="0.8" strokeOpacity="0.5"/>
        <path d="M55 32 Q52 26 49 22" stroke="#143628" strokeWidth="0.8" strokeOpacity="0.5"/>
        <path d="M55 32 Q58 26 61 23" stroke="#143628" strokeWidth="0.8" strokeOpacity="0.5"/>
      </g>
      {/* Accent dots */}
      <circle cx="30" cy="30" r="2" fill="#D4FF00" fillOpacity="0.6"/>
      <circle cx="90" cy="85" r="1.5" fill="#D4FF00" fillOpacity="0.4"/>
      <circle cx="20" cy="80" r="1" fill="#143628" fillOpacity="0.3"/>
    </svg>
  ),

  Dairy: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="dairyGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#111111" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#111111" stopOpacity="0.03"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#dairyGrad)"/>
      {/* Milk splash / droplet pattern */}
      <g fill="#111111" fillOpacity="0.15">
        {/* Main droplet */}
        <path d="M60 25 C60 25 80 35 80 55 C80 75 60 90 60 90 C60 90 40 75 40 55 C40 35 60 25 60 25 Z"/>
        {/* Inner highlight */}
        <path d="M55 35 C55 35 68 42 68 55 C68 65 55 72 55 72 C55 72 42 65 42 55 C42 42 55 35 55 35 Z" fill="#111111" fillOpacity="0.1"/>
        {/* Splash droplets */}
        <circle cx="75" cy="30" r="4" fillOpacity="0.18"/>
        <circle cx="85" cy="45" r="3" fillOpacity="0.15"/>
        <circle cx="45" cy="28" r="3.5" fillOpacity="0.18"/>
        <circle cx="35" cy="48" r="2.5" fillOpacity="0.12"/>
        <circle cx="60" cy="18" r="2" fillOpacity="0.2"/>
      </g>
      {/* Cream swirl */}
      <g stroke="#111111" strokeWidth="1" strokeOpacity="0.12" fill="none" strokeLinecap="round">
        <path d="M50 60 Q55 55 60 60 Q65 65 60 70 Q55 75 50 70 Q45 65 50 60"/>
        <path d="M55 58 Q58 55 62 58 Q65 61 62 64 Q58 67 55 64 Q52 61 55 58" strokeWidth="0.8"/>
      </g>
      {/* Accent line */}
      <line x1="20" y1="100" x2="100" y2="100" stroke="#D4FF00" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round"/>
    </svg>
  ),

  Pantry: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="pantryGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B6914" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#8B6914" stopOpacity="0.04"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#pantryGrad)"/>
      {/* Jar / container silhouette pattern */}
      <g stroke="#8B6914" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Jar 1 - left */}
        <path d="M25 85 L25 45 Q25 35 35 35 L55 35 Q65 35 65 45 L65 85" fill="#8B6914" fillOpacity="0.08"/>
        <line x1="35" y1="35" x2="35" y2="28" stroke="#8B6914" strokeWidth="2"/>
        <ellipse cx="40" cy="28" rx="8" ry="3" stroke="#8B6914" strokeWidth="1.5" fill="none"/>
        {/* Jar 2 - center */}
        <path d="M50 75 L50 40 Q50 30 60 30 L70 30 Q80 30 80 40 L80 75" fill="#8B6914" fillOpacity="0.1"/>
        <line x1="60" y1="30" x2="60" y2="22" stroke="#8B6914" strokeWidth="2.5"/>
        <ellipse cx="65" cy="22" rx="10" ry="3.5" stroke="#8B6914" strokeWidth="1.5" fill="none"/>
        {/* Jar 3 - right */}
        <path d="M75 80 L75 50 Q75 42 83 42 L93 42 Q101 42 101 50 L101 80" fill="#8B6914" fillOpacity="0.06"/>
        <line x1="83" y1="42" x2="83" y2="36" stroke="#8B6914" strokeWidth="1.5"/>
        <ellipse cx="88" cy="36" rx="7" ry="2.5" stroke="#8B6914" strokeWidth="1" fill="none"/>
        {/* Label lines */}
        <line x1="35" y1="60" x2="55" y2="60" stroke="#8B6914" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 2"/>
        <line x1="35" y1="68" x2="50" y2="68" stroke="#8B6914" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 2"/>
        <line x1="60" y1="55" x2="78" y2="55" stroke="#8B6914" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 2"/>
        <line x1="60" y1="62" x2="75" y2="62" stroke="#8B6914" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 2"/>
        <line x1="83" y1="62" x2="95" y2="62" stroke="#8B6914" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 2"/>
      </g>
      {/* Grain/wheat stalks */}
      <g stroke="#8B6914" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round">
        <path d="M15 100 Q18 85 16 70 Q15 60 18 55" strokeWidth="1.2"/>
        <path d="M105 100 Q102 85 104 70 Q105 60 102 55" strokeWidth="1.2"/>
        <path d="M10 95 Q14 75 12 60" strokeWidth="0.8"/>
        <path d="M110 95 Q106 75 108 60" strokeWidth="0.8"/>
      </g>
      {/* Accent */}
      <rect x="55" y="90" width="10" height="4" rx="2" fill="#D4FF00" fillOpacity="0.7"/>
    </svg>
  ),

  Beverages: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bevGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#1E3A5F" stopOpacity="0.04"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#bevGrad)"/>
      {/* Bottle / can pattern with bubbles */}
      <g stroke="#1E3A5F" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Bottle 1 */}
        <path d="M30 85 L30 35 Q30 25 40 25 L50 25 Q60 25 60 35 L60 85" fill="#1E3A5F" fillOpacity="0.08"/>
        <path d="M35 35 L35 20 Q35 15 40 15 L50 15 Q55 15 55 20 L55 35" fill="#1E3A5F" fillOpacity="0.12"/>
        {/* Bottle 2 */}
        <path d="M65 90 L65 45 Q65 37 73 37 L87 37 Q95 37 95 45 L95 90" fill="#1E3A5F" fillOpacity="0.06"/>
        <path d="M70 45 L70 33 Q70 28 75 28 L82 28 Q87 28 87 33 L87 45" fill="#1E3A5F" fillOpacity="0.1"/>
        {/* Can */}
        <path d="M15 65 L15 35 Q15 28 22 28 L38 28 Q45 28 45 35 L45 65" fill="#1E3A5F" fillOpacity="0.08"/>
        <ellipse cx="26.5" cy="28" rx="11" ry="3" stroke="#1E3A5F" strokeWidth="1.5" fill="none"/>
        <ellipse cx="26.5" cy="65" rx="11" ry="3" stroke="#1E3A5F" strokeWidth="1.5" fill="none"/>
      </g>
      {/* Bubbles */}
      <g fill="#1E3A5F" fillOpacity="0.15">
        <circle cx="25" cy="55" r="3"/>
        <circle cx="40" cy="70" r="2"/>
        <circle cx="55" cy="45" r="2.5"/>
        <circle cx="70" cy="65" r="3"/>
        <circle cx="85" cy="50" r="2"/>
        <circle cx="95" cy="70" r="2.5"/>
        <circle cx="105" cy="35" r="1.5"/>
        <circle cx="15" cy="40" r="2"/>
        <circle cx="100" cy="20" r="1.5"/>
        <circle cx="60" cy="100" r="2"/>
      </g>
      {/* Wave pattern at bottom */}
      <g stroke="#1E3A5F" strokeWidth="1" strokeOpacity="0.15" fill="none" strokeLinecap="round">
        <path d="M10 95 Q30 90 50 95 Q70 100 90 95 Q110 90 110 95"/>
        <path d="M10 102 Q30 107 50 102 Q70 97 90 102 Q110 107 110 102" strokeDasharray="8 4"/>
      </g>
      {/* Accent */}
      <circle cx="60" cy="15" r="4" fill="#D4FF00" fillOpacity="0.8"/>
    </svg>
  ),

  Bakery: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bakeryGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5E3C" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#8B5E3C" stopOpacity="0.04"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#bakeryGrad)"/>
      {/* Bread loaf / wheat pattern */}
      <g stroke="#8B5E3C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Loaf 1 - large */}
        <path d="M25 80 Q25 40 55 35 Q85 30 90 45 Q95 60 85 80 Q80 90 25 80" fill="#8B5E3C" fillOpacity="0.1"/>
        {/* Score marks */}
        <path d="M40 50 Q45 40 55 38 Q65 36 70 42" strokeWidth="2" strokeOpacity="0.4"/>
        {/* Loaf 2 - small */}
        <path d="M70 75 Q70 55 85 52 Q100 50 102 62 Q104 75 95 80 Q90 85 70 80" fill="#8B5E3C" fillOpacity="0.08"/>
        {/* Wheat stalks */}
        <path d="M15 105 Q20 85 18 70 Q17 60 22 55" strokeWidth="1.2" strokeOpacity="0.3"/>
        <path d="M10 100 Q14 75 12 60" strokeWidth="0.8" strokeOpacity="0.25"/>
        <path d="M105 105 Q100 85 102 70 Q103 60 98 55" strokeWidth="1.2" strokeOpacity="0.3"/>
        <path d="M110 100 Q106 75 108 60" strokeWidth="0.8" strokeOpacity="0.25"/>
        {/* Crumb texture dots */}
        <circle cx="45" cy="60" r="1.5" fill="#8B5E3C" fillOpacity="0.2"/>
        <circle cx="55" cy="58" r="1" fill="#8B5E3C" fillOpacity="0.25"/>
        <circle cx="65" cy="62" r="1.5" fill="#8B5E3C" fillOpacity="0.2"/>
        <circle cx="50" cy="68" r="1" fill="#8B5E3C" fillOpacity="0.18"/>
        <circle cx="80" cy="68" r="1" fill="#8B5E3C" fillOpacity="0.15"/>
        <circle cx="85" cy="65" r="1.5" fill="#8B5E3C" fillOpacity="0.15"/>
        {/* Croissant curve */}
        <path d="M20 40 Q35 30 45 38 Q50 45 42 52 Q35 58 25 50 Q20 45 22 40" stroke="#8B5E3C" strokeWidth="1.5" strokeOpacity="0.25" fill="none"/>
      </g>
      {/* Accent line */}
      <line x1="15" y1="105" x2="105" y2="105" stroke="#D4FF00" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round"/>
    </svg>
  ),
};

export function CategoryArtwork({ category, className = '' }) {
  const Artwork = categoryArtworks[category] || categoryArtworks.Produce;

  return (
    <div className={`category-artwork ${className}`} aria-hidden="true">
      {Artwork}
    </div>
  );
}

export default CategoryArtwork;