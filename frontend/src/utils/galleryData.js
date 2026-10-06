// ═══════════════════════════════════════════════════════════════════════
// FILE: galleryData.js
// 100% Locally Stored, Offline-Reliable Images for Rooms & Event Halls
// ═══════════════════════════════════════════════════════════════════════

export const ROOM_IMAGE_COLLECTIONS = {
  'Standard': [
    { url: '/assets/images/rooms/standard-1.jpg', caption: 'Primary Bed Sanctuary', tag: 'Master Bed' },
    { url: '/assets/images/rooms/standard-2.jpg', caption: 'Soft Ambient Lounge Corner', tag: 'Lounge' },
    { url: '/assets/images/rooms/standard-3.jpg', caption: 'Artisan Workdesk & Living Space', tag: 'Workstation' },
    { url: '/assets/images/rooms/standard-4.jpg', caption: 'Garden Veranda Morning Sun', tag: 'Veranda' },
    { url: '/assets/images/rooms/standard-5.jpg', caption: 'Warm Evening Mood Lighting', tag: 'Interior' },
    { url: '/assets/images/rooms/standard-6.jpg', caption: 'Modern Countryside Architecture', tag: 'Architecture' },
    { url: '/assets/images/rooms/standard-7.jpg', caption: 'Crisp 400-Thread Linens', tag: 'Comfort' },
    { url: '/assets/images/rooms/standard-8.jpg', caption: 'Dressing Area & Wardrobe', tag: 'Dressing' },
    { url: '/assets/images/rooms/standard-9.jpg', caption: 'En-Suite Rain Shower & Vanity', tag: 'Bathroom' },
    { url: '/assets/images/rooms/standard-10.jpg', caption: 'Artisan Coffee Nook', tag: 'Refreshments' }
  ],
  'Deluxe': [
    { url: '/assets/images/rooms/deluxe-1.jpg', caption: 'Deluxe King Panoramic Vista', tag: 'King Bed' },
    { url: '/assets/images/rooms/deluxe-2.jpg', caption: 'Private Skyline Terrace', tag: 'Balcony' },
    { url: '/assets/images/rooms/deluxe-3.jpg', caption: 'Italian Marble Spa Bathroom', tag: 'Spa Bath' },
    { url: '/assets/images/rooms/deluxe-4.jpg', caption: 'Handcrafted Oak Furnishings', tag: 'Living Area' },
    { url: '/assets/images/rooms/deluxe-5.jpg', caption: 'Sunlit Reading Chaise Nook', tag: 'Relaxation' }
  ],
  'Suite': [
    { url: '/assets/images/rooms/suite-1.jpg', caption: 'Open-Concept Executive Suite', tag: 'Living Salon' },
    { url: '/assets/images/rooms/suite-2.jpg', caption: 'Private Poolside Veranda', tag: 'Veranda' },
    { url: '/assets/images/rooms/suite-3.jpg', caption: 'Deep Soaking Hydrotherapy Tub', tag: 'Jacuzzi' },
    { url: '/assets/images/rooms/suite-4.jpg', caption: 'Bespoke Bar & Intimate Dining', tag: 'Dining' },
    { url: '/assets/images/rooms/suite-5.jpg', caption: 'Primary Bedroom En-Suite Oasis', tag: 'Master Bed' }
  ],
  'Premium Suite': [
    { url: '/assets/images/rooms/premium-1.jpg', caption: 'Presidential Penthouse Panoramic View', tag: 'Penthouse' },
    { url: '/assets/images/rooms/premium-2.jpg', caption: 'Private Infinity Spa Sun Deck', tag: 'Private Terrace' },
    { url: '/assets/images/rooms/premium-3.jpg', caption: 'Private Chef Kitchen & Dining Salon', tag: 'Gourmet Kitchen' }
  ]
};

// Fallback images if type doesn't match directly
export const getRoomGallery = (roomType = '', leadImageUrl = null) => {
  const normalized = (roomType || '').toLowerCase();
  let key = 'Standard';
  if (normalized.includes('president') || normalized.includes('premium')) {
    key = 'Premium Suite';
  } else if (normalized.includes('suite') || normalized.includes('premier')) {
    key = 'Suite';
  } else if (normalized.includes('deluxe')) {
    key = 'Deluxe';
  }

  const baseList = [...(ROOM_IMAGE_COLLECTIONS[key] || ROOM_IMAGE_COLLECTIONS['Standard'])];

  // If a custom lead image is assigned and it's not already in the list, place it first
  if (leadImageUrl && leadImageUrl.trim() !== '') {
    const existingIndex = baseList.findIndex(item => item.url === leadImageUrl);
    if (existingIndex > -1) {
      const [item] = baseList.splice(existingIndex, 1);
      baseList.unshift(item);
    } else {
      baseList.unshift({
        url: leadImageUrl,
        caption: `${roomType || 'Room'} Primary Angle`,
        tag: 'Featured'
      });
    }
  }

  return baseList;
};

// 4 Curated Local Angles per Event Hall
export const EVENT_HALL_GALLERIES = {
  1: [
    { url: '/assets/images/halls/hall-1-1.jpg', caption: 'Olympic Crystal Chandeliers & Banquet', tag: 'Grand Ballroom' },
    { url: '/assets/images/halls/hall-1-2.jpg', caption: 'Acoustic Stage & Concert LED Wall', tag: 'Stage Setup' },
    { url: '/assets/images/halls/hall-1-3.jpg', caption: 'Gilded Red-Carpet Reception Foyer', tag: 'Entrance Foyer' },
    { url: '/assets/images/halls/hall-1-4.jpg', caption: 'Bespoke Banquet Dining & Cocktail Bar', tag: 'Dining Salon' }
  ],
  2: [
    { url: '/assets/images/halls/hall-2-1.jpg', caption: 'Panoramic Glass Atrium & Garden View', tag: 'Glass Atrium' },
    { url: '/assets/images/halls/hall-2-2.jpg', caption: 'Golden Hour Sunset Cocktails & Terrace', tag: 'Sunset Terrace' },
    { url: '/assets/images/halls/hall-2-3.jpg', caption: 'Countryside Lawn Reception Setup', tag: 'Garden Lawn' },
    { url: '/assets/images/halls/hall-2-4.jpg', caption: 'Intelligent Mood Lighting & Dinner Gala', tag: 'Evening Ambience' }
  ],
  3: [
    { url: '/assets/images/halls/hall-3-1.jpg', caption: 'Intimate Acoustic Retreat & Symposium', tag: 'Symposium' },
    { url: '/assets/images/halls/hall-3-2.jpg', caption: 'Executive Roundtables & Keynote Setup', tag: 'Executive' },
    { url: '/assets/images/halls/hall-3-3.jpg', caption: 'Artisanal Floral Decor & Lounge Area', tag: 'Floral Decor' },
    { url: '/assets/images/halls/hall-3-4.jpg', caption: 'Private Cocktail Veranda & Fireplace', tag: 'Veranda' }
  ]
};

export const DEFAULT_HALL_GALLERY = [
  { url: '/assets/images/halls/hall-1-1.jpg', caption: 'Grand Hall Gathering Setup', tag: 'Main Hall' },
  { url: '/assets/images/halls/hall-1-2.jpg', caption: 'Ambient Reception & Cocktails', tag: 'Reception' },
  { url: '/assets/images/halls/hall-1-3.jpg', caption: 'Dynamic Staging & AV Equipment', tag: 'AV & Stage' },
  { url: '/assets/images/halls/hall-1-4.jpg', caption: 'Curated Banquet Dining Service', tag: 'Catering' }
];

export const getHallGallery = (hallId, hallName = '', leadImageUrl = null) => {
  const base = EVENT_HALL_GALLERIES[hallId] 
    ? [...EVENT_HALL_GALLERIES[hallId]] 
    : [...DEFAULT_HALL_GALLERY];

  if (leadImageUrl && leadImageUrl.trim() !== '') {
    const existingIndex = base.findIndex(item => item.url === leadImageUrl);
    if (existingIndex > -1) {
      const [item] = base.splice(existingIndex, 1);
      base.unshift(item);
    } else {
      base.unshift({
        url: leadImageUrl,
        caption: `${hallName || 'Hall'} Main View`,
        tag: 'Featured'
      });
      if (base.length > 4) base.pop();
    }
  }

  return base;
};
