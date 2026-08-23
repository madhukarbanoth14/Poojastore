import { useState, useRef, useCallback, useEffect } from 'react';
import { KITS, ESSENTIALS } from './data';
import { stripe } from './theme';

const TAB_SCREENS = ['home', 'categories', 'priests', 'profile'];

const INITIAL = {
  screen: 'splash',
  history: [],
  theme: 'light',
  onboardIdx: 0,
  mobile: '',
  otpDigits: ['', '', '', ''],
  otpTimer: 30,
  selectedCategory: 'festival-kits',
  selectedProductId: 'k1',
  productSourceList: KITS,
  productQty: 1,
  selectedPriestId: 'p1',
  bookingMode: 'home',
  bookingDateIdx: 0,
  bookingTimeIdx: null,
  bookingRitualIdx: null,
  cart: [],
  couponCode: '',
  couponApplied: false,
  addressIdx: 0,
  slotIdx: 0,
  paymentIdx: 0,
  trackingStep: 0,
  wishlist: ['k1', 'd5'],
  profileSection: null,
  muted: false,
  videoOff: false,
  chatOpen: false,
  callSeconds: 0,
};

// Functional port of the dc.html `Component` class. Returns the state object and
// a bag of action callbacks. Timers (splash auto-advance, otp countdown, order
// tracking progression, call duration) are driven by effects keyed on `screen`.
export function useApp() {
  const [state, setState] = useState(INITIAL);
  const merge = useCallback((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const isDark = state.theme === 'dark';

  const go = useCallback((screen, extra) => {
    setState((s) => ({ ...s, screen, history: [...s.history, s.screen], ...(extra || {}) }));
  }, []);

  const back = useCallback(() => {
    setState((s) => {
      const h = [...s.history];
      const prev = h.pop();
      return { ...s, screen: prev || 'home', history: h };
    });
  }, []);

  const goTab = useCallback((tab) => merge({ screen: tab, history: [] }), [merge]);

  // ---- Splash auto-advance ----
  useEffect(() => {
    if (state.screen !== 'splash') return;
    const id = setTimeout(() => {
      setState((s) => (s.screen === 'splash' ? { ...s, screen: 'onboarding', history: [] } : s));
    }, 2400);
    return () => clearTimeout(id);
  }, [state.screen]);

  // ---- OTP countdown ----
  useEffect(() => {
    if (state.screen !== 'otp') return;
    setState((s) => ({ ...s, otpTimer: 30 }));
    const id = setInterval(() => {
      setState((s) => {
        if (s.otpTimer <= 1) return { ...s, otpTimer: 0 };
        return { ...s, otpTimer: s.otpTimer - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.screen]);

  // ---- Order tracking progression ----
  useEffect(() => {
    if (state.screen !== 'tracking') return;
    setState((s) => ({ ...s, trackingStep: 0 }));
    const id = setInterval(() => {
      setState((s) => {
        if (s.trackingStep >= 4) return s;
        return { ...s, trackingStep: s.trackingStep + 1 };
      });
    }, 2800);
    return () => clearInterval(id);
  }, [state.screen]);

  // ---- Video call duration ----
  useEffect(() => {
    if (state.screen !== 'video') return;
    setState((s) => ({ ...s, callSeconds: 0, muted: false, videoOff: false, chatOpen: false }));
    const id = setInterval(() => setState((s) => ({ ...s, callSeconds: s.callSeconds + 1 })), 1000);
    return () => clearInterval(id);
  }, [state.screen]);

  // ---- Cart ----
  const addToCartItem = useCallback((item) => {
    setState((s) => {
      const cart = s.cart.map((c) => ({ ...c }));
      const existing = cart.find((c) => c.id === item.id);
      if (existing) existing.qty += item.qty || 1;
      else cart.push({ ...item, qty: item.qty || 1 });
      return { ...s, cart };
    });
  }, []);

  const currentProduct = useCallback((s = state) => {
    const dark = s.theme === 'dark';
    const list = s.productSourceList || KITS;
    let p = list.find((x) => x.id === s.selectedProductId)
      || KITS.find((x) => x.id === s.selectedProductId)
      || ESSENTIALS.find((x) => x.id === s.selectedProductId);
    if (!p) p = KITS[0];
    const kIdx = KITS.findIndex((k) => k.id === p.id);
    const idx = kIdx >= 0 ? kIdx : ESSENTIALS.findIndex((k) => k.id === p.id) + 4;
    return { ...p, _idx: idx < 0 ? 0 : idx };
  }, [state]);

  const actions = {
    setState: merge,
    go,
    back,
    goTab,
    toggleTheme: () => merge((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

    skipOnboarding: () => go('login'),
    onboardNext: () => setState((s) => (s.onboardIdx >= 3
      ? { ...s, screen: 'login', history: [...s.history, s.screen] }
      : { ...s, onboardIdx: s.onboardIdx + 1 })),

    onMobileChange: (v) => merge({ mobile: v.replace(/\D/g, '').slice(0, 10) }),
    sendOtp: () => go('otp'),
    socialLogin: () => merge({ screen: 'home', history: [] }),

    setOtpDigit: (idx, val) => setState((s) => {
      const d = [...s.otpDigits];
      d[idx] = val.replace(/\D/g, '').slice(-1);
      return { ...s, otpDigits: d };
    }),
    verifyOtp: () => merge({ screen: 'home', history: [] }),

    go_home: () => goTab('home'),
    go_categories: () => goTab('categories'),
    go_priests: () => goTab('priests'),
    go_profile: () => goTab('profile'),
    go_notifications: () => go('notifications'),
    go_festival: () => go('festival'),
    go_checkout: () => go('checkout'),

    selectCategory: (id) => merge({ selectedCategory: id }),
    openProduct: (id, list) => setState((s) => ({
      ...s, selectedProductId: id, productSourceList: list || KITS, productQty: 1,
      screen: 'product', history: [...s.history, s.screen],
    })),
    openPriest: (id) => setState((s) => ({
      ...s, selectedPriestId: id, screen: 'priestProfile', history: [...s.history, s.screen],
    })),

    addFestivalKitToCart: () => addToCartItem({
      id: 'ganesh-kit', name: 'Ganesh Puja Homam Samagri Kit', price: 1999, type: 'kit',
      stripe: stripe(0, isDark),
    }),
    addProductToCart: () => {
      const p = currentProduct();
      addToCartItem({ id: p.id, name: p.name, price: p.price, type: 'product', stripe: stripe(p._idx, isDark), qty: state.productQty || 1 });
    },
    incQty: () => merge((s) => ({ productQty: (s.productQty || 1) + 1 })),
    decQty: () => merge((s) => ({ productQty: Math.max(1, (s.productQty || 1) - 1) })),
    incCartItem: (id) => merge((s) => ({ cart: s.cart.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)) })),
    decCartItem: (id) => merge((s) => ({ cart: s.cart.map((c) => (c.id === id ? { ...c, qty: Math.max(1, c.qty - 1) } : c)) })),

    onCouponChange: (v) => merge({ couponCode: v }),
    applyCoupon: () => merge((s) => ({ couponApplied: s.couponCode.trim().length > 0 ? !s.couponApplied : s.couponApplied })),

    placeOrder: () => setState((s) => ({ ...s, cart: [], couponApplied: false, trackingStep: 0, screen: 'tracking', history: [...s.history, s.screen] })),

    go_bookOnline: () => setState((s) => ({ ...s, bookingMode: 'online', screen: 'booking', history: [...s.history, s.screen] })),
    go_bookHome: () => setState((s) => ({ ...s, bookingMode: 'home', screen: 'booking', history: [...s.history, s.screen] })),
    selectBookingDate: (i) => merge({ bookingDateIdx: i }),
    selectBookingTime: (i) => merge({ bookingTimeIdx: i }),
    selectRitual: (i) => merge({ bookingRitualIdx: i }),
    confirmBooking: () => go(state.bookingMode === 'online' ? 'video' : 'tracking'),

    toggleMute: () => merge((s) => ({ muted: !s.muted })),
    toggleVideoOff: () => merge((s) => ({ videoOff: !s.videoOff })),
    toggleChat: () => merge((s) => ({ chatOpen: !s.chatOpen })),
    endCall: () => go('priestProfile'),

    openProfileSection: (section) => setState((s) => ({ ...s, profileSection: section, screen: 'profileDetail', history: [...s.history, s.screen] })),
    logout: () => merge({ screen: 'login', history: [], cart: [] }),
    toggleWishlist: (id) => merge((s) => ({ wishlist: s.wishlist.includes(id) ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id] })),

    setAddress: (i) => merge({ addressIdx: i }),
    setSlot: (i) => merge({ slotIdx: i }),
    setPayment: (i) => merge({ paymentIdx: i }),
  };

  return { state, actions, isDark, currentProduct, TAB_SCREENS };
}

export { TAB_SCREENS };
