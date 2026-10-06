// ═══════════════════════════════════════════════════════════════════════
// FILE: galleryData.js
// Curated Multi-Image Galleries for Hotel Rooms & Event Halls
// ═══════════════════════════════════════════════════════════════════════

export const ROOM_IMAGE_COLLECTIONS = {
  'Standard': [
    { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80', caption: 'Primary Bed Sanctuary', tag: 'Master Bed' },
    { url: 'https://images.unsplash.com/photo-1598928506311-c55dd129a0eb?w=1200&q=80', caption: 'Soft Ambient Lounge Corner', tag: 'Lounge' },
    { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', caption: 'Artisan Workdesk & Living Space', tag: 'Workstation' },
    { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80', caption: 'Garden Veranda Morning Sun', tag: 'Veranda' },
    { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', caption: 'Warm Evening Mood Lighting', tag: 'Interior' },
    { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80', caption: 'Modern Countryside Architecture', tag: 'Architecture' },
    { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80', caption: 'Crisp 400-Thread Linens', tag: 'Comfort' },
    { url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80', caption: 'Dressing Area & Wardrobe', tag: 'Dressing' },
    { url: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=1200&q=80', caption: 'En-Suite Rain Shower & Vanity', tag: 'Bathroom' },
    { url: 'https://images.unsplash.com/photo-1590490360182-c33d5773342b?w=1200&q=80', caption: 'Artisan Coffee Nook', tag: 'Refreshments' }
  ],
  'Deluxe': [
    { url: 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=1200&q=80', caption: 'Deluxe King Panoramic Vista', tag: 'King Bed' },
    { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80', caption: 'Private Skyline Terrace', tag: 'Balcony' },
    { url: 'https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=1200&q=80', caption: 'Italian Marble Spa Bathroom', tag: 'Spa Bath' },
    { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80', caption: 'Handcrafted Oak Furnishings', tag: 'Living Area' },
    { url: 'https://images.unsplash.com/photo-1522771731478-444855018a1a?w=1200&q=80', caption: 'Sunlit Reading Chaise Nook', tag: 'Relaxation' }
  ],
  'Suite': [
    { url: 'https://images.unsplash.com/photo-1502672260266-1c1ff2d6c411?w=1200&q=80', caption: 'Open-Concept Executive Suite', tag: 'Living Salon' },
    { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80', caption: 'Private Poolside Veranda', tag: 'Veranda' },
    { url: 'https://images.unsplash.com/photo-1574643034914-1eeab3636bdf?w=1200&q=80', caption: 'Deep Soaking Hydrotherapy Tub', tag: 'Jacuzzi' },
    { url: 'https://images.unsplash.com/photo-1630660664869-c9d3cc676880?w=1200&q=80', caption: 'Bespoke Bar & Intimate Dining', tag: 'Dining' },
    { url: 'https://images.unsplash.com/photo-1560185013-1f744e83f2df?w=1200&q=80', caption: 'Primary Bedroom En-Suite Oasis', tag: 'Master Bed' }
  ],
  'Premium Suite': [
    { url: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=1200&q=80', caption: 'Presidential Penthouse Panoramic View', tag: 'Penthouse' },
    { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', caption: 'Private Infinity Spa Sun Deck', tag: 'Private Terrace' },
    { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80', caption: 'Private Chef Kitchen & Dining Salon', tag: 'Gourmet Kitchen' }
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

  // If a custom lead image is assigned, make sure it is at index 0
  if (leadImageUrl && leadImageUrl.trim() !== '') {
    const existingIndex = baseList.findIndex(item => item.url === leadImageUrl);
    if (existingIndex > -1) {
      const [item] = baseList.splice(existingIndex, 1);
      baseList.unshift(item);
    } else {
      baseList.unshift({
        url: leadImageUrl,
        caption: `${roomType || 'Room'} Showcase`,
        tag: 'Featured'
      });
    }
  }

  return baseList;
};

// 4 Curated Images per Event Hall
export const EVENT_HALL_GALLERIES = {
  1: [
    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80', caption: 'Olympic Crystal Chandeliers & Banquet', tag: 'Grand Ballroom' },
    { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80', caption: 'Acoustic Stage & Concert LED Wall', tag: 'Stage Setup' },
    { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80', caption: 'Gilded Red-Carpet Reception Foyer', tag: 'Entrance Foyer' },
    { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80', caption: 'Bespoke Banquet Dining & Cocktail Bar', tag: 'Dining Salon' }
  ],
  2: [
    { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80', caption: 'Panoramic Glass Atrium & Garden View', tag: 'Glass Atrium' },
    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80', caption: 'Golden Hour Sunset Cocktails & Terrace', tag: 'Sunset Terrace' },
    { url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80', caption: 'Countryside Lawn Reception Setup', tag: 'Garden Lawn' },
    { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80', caption: 'Intelligent Mood Lighting & Dinner Gala', tag: 'Evening Ambience' }
  ],
  3: [
    { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80', caption: 'Intimate Acoustic Retreat & Symposium', tag: 'Symposium' },
    { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80', caption: 'Executive Roundtables & Keynote Setup', tag: 'Executive' },
    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80', caption: 'Artisanal Floral Decor & Lounge Area', tag: 'Floral Decor' },
    { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80', caption: 'Private Cocktail Veranda & Fireplace', tag: 'Veranda' }
  ]
};

export const DEFAULT_HALL_GALLERY = [
  { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80', caption: 'Grand Hall Gathering Setup', tag: 'Main Hall' },
  { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80', caption: 'Ambient Reception & Cocktails', tag: 'Reception' },
  { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80', caption: 'Dynamic Staging & AV Equipment', tag: 'AV & Stage' },
  { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80', caption: 'Curated Banquet Dining Service', tag: 'Catering' }
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
