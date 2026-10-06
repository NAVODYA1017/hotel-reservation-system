import axios from 'axios';

const LOCAL_STORAGE_KEY = 'hotel_buffet_reservations_store';

const DEFAULT_SESSIONS = [
  {
    mealSession: 'BREAKFAST',
    sessionTitle: 'Sunrise Champagne Breakfast',
    timeRange: '06:30 AM - 10:30 AM',
    maxCapacity: 50,
    adultPrice: 4500,
    childPrice: 2250,
    image: '/assets/images/dining/breakfast_buffet.jpg',
    description: 'Fresh tropical fruit pavilion, live egg & hopper station, artisanal Ceylon teas, and European bakery selections.',
    slots: ['06:30 AM', '07:30 AM', '08:30 AM', '09:30 AM']
  },
  {
    mealSession: 'LUNCH',
    sessionTitle: 'Ceylon Royal Spice Lunch',
    timeRange: '12:30 PM - 03:30 PM',
    maxCapacity: 60,
    adultPrice: 6500,
    childPrice: 3250,
    image: '/assets/images/dining/lunch_buffet.jpg',
    description: 'Authentic Sigiriya clay pot curries, fragrant biryanis, ocean catches, roast carvings, and garden salad bars.',
    slots: ['12:30 PM', '01:15 PM', '02:00 PM', '02:45 PM']
  },
  {
    mealSession: 'DINNER',
    sessionTitle: 'Grand Seafood & Starlit Dinner',
    timeRange: '07:00 PM - 10:30 PM',
    maxCapacity: 70,
    adultPrice: 8900,
    childPrice: 4450,
    image: '/assets/images/dining/dinner_buffet.jpg',
    description: 'Jumbo prawns, yellowfin tuna steaks, live Mongolian grill, hand-rolled sushi, and flambé dessert station.',
    slots: ['07:00 PM', '07:45 PM', '08:30 PM', '09:15 PM']
  }
];

function getStoredReservations() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredReservations(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to write to local storage', err);
  }
}

export const buffetApi = {
  getSessionsMeta: () => DEFAULT_SESSIONS,

  /**
   * Fetch slot capacity & availability for a given date.
   */
  async getAvailability(dateStr) {
    try {
      const res = await axios.get('/api/buffet/availability', { params: { date: dateStr } });
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback to local computation
    }

    const localList = getStoredReservations();
    return DEFAULT_SESSIONS.map(s => {
      const activeForSession = localList.filter(
        r => r.reservationDate === dateStr && r.mealSession === s.mealSession && r.status !== 'CANCELLED'
      );
      const bookedSeats = activeForSession.reduce((acc, curr) => acc + (Number(curr.numberOfGuests) || 0), 0);
      const remainingSeats = Math.max(0, s.maxCapacity - bookedSeats);

      return {
        date: dateStr,
        mealSession: s.mealSession,
        sessionTitle: s.sessionTitle,
        timeRange: s.timeRange,
        maxCapacity: s.maxCapacity,
        bookedSeats,
        remainingSeats,
        isSoldOut: remainingSeats <= 0,
        adultPrice: s.adultPrice,
        childPrice: s.childPrice
      };
    });
  },

  /**
   * Make a customer or front desk buffet booking.
   */
  async createReservation(payload) {
    try {
      const res = await axios.post('/api/buffet/reserve', payload);
      if (res.data) {
        // Also sync local storage mirror
        const current = getStoredReservations();
        saveStoredReservations([res.data, ...current]);
        return res.data;
      }
    } catch {
      // Offline fallback
    }

    // Local reservation creation
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const dateCode = (payload.reservationDate || '').replace(/-/g, '') || '20261006';
    const confirmationCode = `BUF-${dateCode}-${randomDigits}`;

    const sessionInfo = DEFAULT_SESSIONS.find(s => s.mealSession === payload.mealSession) || DEFAULT_SESSIONS[0];
    const adultPrice = sessionInfo.adultPrice;
    const childPrice = sessionInfo.childPrice;
    const adultCount = Number(payload.adultCount) || 1;
    const childCount = Number(payload.childCount) || 0;
    const totalAmount = adultPrice * adultCount + childPrice * childCount;

    const newReservation = {
      id: Date.now(),
      confirmationCode,
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone || '',
      reservationDate: payload.reservationDate,
      mealSession: payload.mealSession,
      timeSlot: payload.timeSlot || sessionInfo.timeRange,
      adultCount,
      childCount,
      numberOfGuests: adultCount + childCount,
      pricePerPerson: adultPrice,
      totalAmount,
      specialDietary: payload.specialDietary || 'None',
      status: 'CONFIRMED',
      tableNumber: payload.tableNumber || '',
      bookedBy: payload.bookedBy || 'CLIENT_WEBSITE',
      checkedInAt: null,
      createdAt: new Date().toISOString()
    };

    const current = getStoredReservations();
    saveStoredReservations([newReservation, ...current]);
    return newReservation;
  },

  /**
   * Search / verify a single booking by confirmation code.
   */
  async verifyCode(code) {
    try {
      const res = await axios.get(`/api/buffet/verify/${encodeURIComponent(code)}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    const current = getStoredReservations();
    const found = current.find(r => r.confirmationCode?.toUpperCase() === code?.toUpperCase());
    if (found) return found;
    throw new Error(`No buffet reservation found for code: ${code}`);
  },

  /**
   * Get all reservations for Front Desk administration.
   */
  async getAllReservations(params = {}) {
    try {
      const res = await axios.get('/api/buffet/admin/all', { params });
      if (Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    let list = getStoredReservations();
    if (params.date) {
      list = list.filter(r => r.reservationDate === params.date);
    }
    if (params.session) {
      list = list.filter(r => r.mealSession === params.session);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        r =>
          r.confirmationCode?.toLowerCase().includes(q) ||
          r.guestName?.toLowerCase().includes(q) ||
          r.guestEmail?.toLowerCase().includes(q) ||
          r.tableNumber?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  /**
   * Front Desk Check-In.
   */
  async checkInGuest(id, tableNumber = '') {
    try {
      const res = await axios.post(`/api/buffet/admin/check-in/${id}`, { tableNumber });
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    const current = getStoredReservations();
    const updated = current.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'CHECKED_IN',
          checkedInAt: new Date().toISOString(),
          tableNumber: tableNumber || r.tableNumber || 'Assigned at Door'
        };
      }
      return r;
    });
    saveStoredReservations(updated);
    return updated.find(r => r.id === id);
  },

  /**
   * Front Desk Walk-In Booking.
   */
  async createWalkIn(payload) {
    try {
      const res = await axios.post('/api/buffet/admin/walk-in', payload);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    return this.createReservation({
      ...payload,
      bookedBy: 'RECEPTIONIST_WALKIN'
    });
  },

  /**
   * Cancel a reservation.
   */
  async cancelReservation(id) {
    try {
      const res = await axios.post(`/api/buffet/admin/cancel/${id}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    const current = getStoredReservations();
    const updated = current.map(r => (r.id === id ? { ...r, status: 'CANCELLED' } : r));
    saveStoredReservations(updated);
    return updated.find(r => r.id === id);
  }
};
