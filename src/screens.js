import React from 'react';
import { View, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { H, TXT, Stripe, DiyaFlame, Flags, Dot } from './ui';
import { FONT, stripe, monoBg, stars, initials } from './theme';
import {
  CATEGORY_DEFS, KITS, ESSENTIALS, STORES, PRIESTS, ONBOARD_SLIDES, NOTIFICATIONS,
  ORDER_HISTORY, PRIEST_HISTORY, FAMILY, REQUIRED_ITEMS, ADDRESS_LIST, SLOT_LIST,
  PAYMENT_LIST, TRACKING_STEPS, BOOKING_TIMES, RITUAL_OPTIONS,
} from './data';

const TABS = ['home', 'categories', 'priests', 'profile'];

/* ---------------- shared chrome ---------------- */

function Header({ t, title, showBack, onBack }) {
  return (
    <View style={{ backgroundColor: t.bg, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
      {showBack ? (
        <Pressable onPress={onBack} style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
          <TXT style={{ fontSize: 17, color: t.text }}>←</TXT>
        </Pressable>
      ) : null}
      <H style={{ fontSize: 18, color: t.text }}>{title}</H>
    </View>
  );
}

function BottomNav({ t, screen, actions }) {
  const defs = [
    { key: 'home', label: 'Home' },
    { key: 'categories', label: 'Categories' },
    { key: 'priests', label: 'Poojaris' },
    { key: 'profile', label: 'Profile' },
  ];
  return (
    <View style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, flexDirection: 'row', paddingTop: 10, paddingBottom: 22, paddingHorizontal: 6 }}>
      {defs.map((n) => {
        const active = screen === n.key;
        const color = active ? t.saffron : t.textMuted;
        let icon;
        if (n.key === 'home') icon = <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: color }} />;
        else if (n.key === 'categories') icon = (
          <View style={{ width: 20, height: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
            {[0, 1, 2, 3].map((i) => <View key={i} style={{ width: 8.5, height: 8.5, borderRadius: 2, backgroundColor: color }} />)}
          </View>
        );
        else if (n.key === 'priests') icon = <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: color }} />;
        else icon = <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color }} />;
        return (
          <Pressable key={n.key} onPress={() => actions.goTab(n.key)} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
            {icon}
            <TXT style={{ fontSize: 10.5, fontFamily: FONT.bodySemi, color }}>{n.label}</TXT>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------- screens ---------------- */

function Splash({ t }) {
  const flags = [t.saffron, t.gold, '#FBF3E3', t.saffron, t.gold, '#FBF3E3', t.saffron, t.gold, '#FBF3E3', t.saffron];
  return (
    <LinearGradient colors={[t.maroon, t.maroonDeep]} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><Flags colors={flags} big /></View>
      <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(212,175,55,.35)', borderStyle: 'dashed' }} />
        <View style={{ position: 'absolute', width: 178, height: 178, borderRadius: 89, borderWidth: 1, borderColor: 'rgba(212,175,55,.5)', borderStyle: 'dashed' }} />
        <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: t.gold, alignItems: 'center', justifyContent: 'center' }}>
          <DiyaFlame size={26} color={t.maroonDeep} />
        </View>
      </View>
      <H style={{ fontSize: 30, color: '#FBF3E3', letterSpacing: 0.5 }}>Pooja Store</H>
      <TXT style={{ fontSize: 14, color: 'rgba(251,243,227,.75)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Divine essentials, delivered</TXT>
      <View style={{ flexDirection: 'row', gap: 7, marginTop: 14 }}>
        {[0, 1, 2].map((i) => <Dot key={i} color={t.gold} />)}
      </View>
    </LinearGradient>
  );
}

function Onboarding({ t, state, actions, isDark }) {
  const slide = ONBOARD_SLIDES[state.onboardIdx];
  const btnLabel = state.onboardIdx >= ONBOARD_SLIDES.length - 1 ? 'Get Started' : 'Next';
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: 14 }}>
        <Flags colors={[t.saffron, t.gold, t.maroon, t.saffron, t.gold, t.maroon, t.saffron]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 22, paddingTop: 14 }}>
        <Pressable onPress={actions.skipOnboarding}><TXT style={{ fontSize: 14, fontFamily: FONT.bodySemi, color: t.textMuted }}>Skip</TXT></Pressable>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, gap: 22 }}>
        <Stripe data={stripe(state.onboardIdx, isDark)} radius={24} style={{ width: '100%', aspectRatio: 1.3, alignItems: 'center', justifyContent: 'center' }}>
          <TXT style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: 1, color: t.maroon, opacity: 0.55 }}>{slide.label}</TXT>
        </Stripe>
        <H style={{ fontSize: 23, color: t.text, textAlign: 'center', lineHeight: 30 }}>{slide.title}</H>
        <TXT style={{ fontSize: 15, color: t.textMuted, textAlign: 'center', lineHeight: 23 }}>{slide.desc}</TXT>
      </View>
      <View style={{ alignItems: 'center', gap: 20, paddingHorizontal: 30, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {ONBOARD_SLIDES.map((_, i) => (
            <View key={i} style={{ width: i === state.onboardIdx ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === state.onboardIdx ? t.saffron : t.border }} />
          ))}
        </View>
        <Pressable onPress={actions.onboardNext} style={{ width: '100%', padding: 16, borderRadius: 16, backgroundColor: t.saffron, alignItems: 'center' }}>
          <H style={{ fontFamily: FONT.headSemi, fontSize: 16, color: '#fff' }}>{btnLabel}</H>
        </Pressable>
      </View>
    </View>
  );
}

function Login({ t, state, actions }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 28, paddingTop: 56, paddingBottom: 40, flexGrow: 1 }}>
      <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: t.maroon, alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
        <DiyaFlame size={16} color={t.gold} />
      </View>
      <H style={{ fontSize: 26, color: t.text, marginBottom: 8 }}>Welcome back</H>
      <TXT style={{ fontSize: 14.5, color: t.textMuted, marginBottom: 32 }}>Sign in to continue your seva</TXT>

      <TXT style={{ fontSize: 12.5, fontFamily: FONT.bodySemi, color: t.textMuted, marginBottom: 8, letterSpacing: 0.3 }}>MOBILE NUMBER</TXT>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 20 }}>
        <TXT style={{ fontFamily: FONT.bodySemi, color: t.text }}>+91</TXT>
        <View style={{ width: 1, height: 18, backgroundColor: t.border }} />
        <TextInput value={state.mobile} onChangeText={actions.onMobileChange} placeholder="98765 43210" placeholderTextColor={t.textMuted} keyboardType="number-pad" style={{ flex: 1, fontSize: 15.5, color: t.text, fontFamily: FONT.body, paddingVertical: 11 }} />
      </View>
      <Pressable onPress={actions.sendOtp} style={{ padding: 16, borderRadius: 14, backgroundColor: t.saffron, alignItems: 'center', marginBottom: 26 }}>
        <H style={{ fontFamily: FONT.headSemi, fontSize: 15.5, color: '#fff' }}>Send OTP</H>
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 26 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
        <TXT style={{ fontSize: 12.5, color: t.textMuted }}>or continue with</TXT>
        <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
      </View>

      <Pressable onPress={actions.socialLogin} style={{ padding: 15, borderWidth: 1, borderColor: t.border, borderRadius: 14, backgroundColor: t.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
        <LinearGradient colors={['#4285F4', '#EA4335', '#FBBC05', '#34A853']} style={{ width: 18, height: 18, borderRadius: 9 }} />
        <TXT style={{ fontFamily: FONT.bodySemi, fontSize: 15, color: t.text }}>Continue with Google</TXT>
      </Pressable>
      <Pressable onPress={actions.socialLogin} style={{ padding: 15, borderWidth: 1, borderColor: t.border, borderRadius: 14, backgroundColor: t.textDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <View style={{ width: 15, height: 18, borderRadius: 7, backgroundColor: '#fff' }} />
        <TXT style={{ fontFamily: FONT.bodySemi, fontSize: 15, color: '#fff' }}>Continue with Apple</TXT>
      </Pressable>

      <TXT style={{ marginTop: 'auto', paddingTop: 30, fontSize: 12, color: t.textMuted, textAlign: 'center', lineHeight: 19 }}>By continuing you agree to our Terms of Service and Privacy Policy</TXT>
    </ScrollView>
  );
}

function Otp({ t, state, actions }) {
  const timerText = state.otpTimer > 0 ? `Resend OTP in 00:${String(state.otpTimer).padStart(2, '0')}` : "Didn't receive code? Resend";
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 28, paddingTop: 56, paddingBottom: 40 }}>
      <Pressable onPress={actions.back} style={{ alignSelf: 'flex-start', marginBottom: 24 }}><TXT style={{ fontSize: 22, color: t.text }}>←</TXT></Pressable>
      <H style={{ fontSize: 24, color: t.text, marginBottom: 8 }}>Verify your number</H>
      <TXT style={{ fontSize: 14.5, color: t.textMuted, marginBottom: 34 }}>Code sent to +91 {state.mobile || '98765 43210'}</TXT>
      <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 22 }}>
        {state.otpDigits.map((v, i) => (
          <TextInput key={i} value={v} onChangeText={(val) => actions.setOtpDigit(i, val)} maxLength={1} keyboardType="number-pad"
            style={{ width: 56, height: 64, textAlign: 'center', fontSize: 24, fontFamily: FONT.head, borderRadius: 14, borderWidth: 1.5, borderColor: t.border, backgroundColor: t.surface, color: t.text }} />
        ))}
      </View>
      <TXT style={{ textAlign: 'center', fontSize: 13.5, color: t.textMuted, marginBottom: 30 }}>{timerText}</TXT>
      <Pressable onPress={actions.verifyOtp} style={{ padding: 16, borderRadius: 14, backgroundColor: t.saffron, alignItems: 'center' }}>
        <H style={{ fontFamily: FONT.headSemi, fontSize: 15.5, color: '#fff' }}>Verify & Continue</H>
      </Pressable>
    </ScrollView>
  );
}

function Card({ t, children, style }) {
  return <View style={[{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16 }, style]}>{children}</View>;
}

function Home({ t, actions, isDark }) {
  const homeCategories = CATEGORY_DEFS.slice(0, 7).map((c, i) => ({ ...c, bg: i % 2 === 0 ? t.chipBg : 'transparent', fg: i % 3 === 0 ? t.maroon : t.saffron }));
  const offerCards = [
    { title: 'Festival Special', desc: 'Flat 20% off on all Festival Kits', code: 'FEST20', bg: isDark ? 'rgba(212,175,55,.10)' : 'rgba(212,175,55,.14)' },
    { title: 'First Booking', desc: '₹100 off your first Poojari booking', code: 'PRIEST100', bg: isDark ? 'rgba(255,107,0,.10)' : 'rgba(255,107,0,.10)' },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      {/* greeting */}
      <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <TXT style={{ fontSize: 13, color: t.textMuted }}>Namaste,</TXT>
            <H style={{ fontSize: 19, color: t.text }}>Aarav Sharma</H>
          </View>
          <Pressable onPress={actions.go_notifications} style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 14, height: 14, borderWidth: 2, borderColor: t.text, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomWidth: 0 }} />
            <View style={{ position: 'absolute', top: 7, right: 9, width: 8, height: 8, backgroundColor: t.saffron, borderRadius: 4, borderWidth: 2, borderColor: t.bg }} />
          </Pressable>
        </View>
        <Pressable onPress={actions.go_profile} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Dot size={7} color={t.saffron} />
          <TXT style={{ fontSize: 13.5, color: t.text, fontFamily: FONT.bodyMed }}>Deliver to: Home, 4th Cross, Malleshwaram</TXT>
          <TXT style={{ fontSize: 13, color: t.textMuted }}>›</TXT>
        </Pressable>
      </View>

      {/* search */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Pressable onPress={actions.go_categories} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 }}>
          <View style={{ width: 16, height: 16, borderWidth: 2, borderColor: t.textMuted, borderRadius: 8 }} />
          <TXT style={{ fontSize: 14.5, color: t.textMuted }}>Search pooja kits, items, priests…</TXT>
        </Pressable>
      </View>

      {/* festival banner */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <LinearGradient colors={[t.maroon, t.maroonDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 20, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(212,175,55,.18)' }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Dot key={i} size={9} color={i % 2 ? t.saffron : t.gold} style={{ opacity: 0.8 }} />)}
          </View>
          <TXT style={{ fontSize: 11.5, fontFamily: FONT.bodyBold, letterSpacing: 1, color: t.gold, textTransform: 'uppercase' }}>Upcoming Festival</TXT>
          <H style={{ fontSize: 21, color: '#FBF3E3', marginTop: 6, marginBottom: 4 }}>Ganesh Chaturthi</H>
          <TXT style={{ fontSize: 13, color: 'rgba(251,243,227,.8)', marginBottom: 16 }}>Sept 6, 2026 · 36 days to go</TXT>
          <Pressable onPress={actions.go_festival} style={{ alignSelf: 'flex-start', backgroundColor: t.gold, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 11 }}>
            <TXT style={{ fontFamily: FONT.bodyBold, fontSize: 13.5, color: t.maroonDeep }}>Shop Festival Kits</TXT>
          </Pressable>
        </LinearGradient>
      </View>

      {/* categories */}
      <H style={{ paddingHorizontal: 20, paddingBottom: 12, fontSize: 16, color: t.text }}>Categories</H>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 6 }}>
        {homeCategories.map((c) => (
          <Pressable key={c.id} onPress={() => { actions.selectCategory(c.id); actions.go('categories'); }} style={{ alignItems: 'center', gap: 8, width: 64 }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
              <H style={{ fontSize: 16, color: c.fg }}>{c.mono}</H>
            </View>
            <TXT style={{ fontSize: 11.5, color: t.textMuted, textAlign: 'center' }}>{c.name}</TXT>
          </Pressable>
        ))}
      </ScrollView>

      {/* popular kits */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
        <H style={{ fontSize: 16, color: t.text }}>Popular Pooja Kits</H>
        <Pressable onPress={actions.go_categories}><TXT style={{ fontSize: 13, color: t.saffron, fontFamily: FONT.bodySemi }}>See all</TXT></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 6 }}>
        {KITS.map((k, i) => (
          <Pressable key={k.id} onPress={() => actions.openProduct(k.id, KITS)} style={{ width: 168, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 18, overflow: 'hidden' }}>
            <Stripe data={stripe(i, isDark)} style={{ height: 110 }} />
            <View style={{ padding: 12 }}>
              <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodySemi, color: t.text, marginBottom: 4 }}>{k.name}</TXT>
              <TXT style={{ fontSize: 11.5, color: t.gold, marginBottom: 6 }}>{stars(k.rating)} <TXT style={{ color: t.textMuted }}>({k.reviews})</TXT></TXT>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <TXT style={{ fontFamily: FONT.bodyBold, fontSize: 14.5, color: t.text }}>₹{k.price}</TXT>
                <TXT style={{ fontSize: 12, color: t.textMuted, textDecorationLine: 'line-through' }}>₹{k.mrp}</TXT>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* daily essentials */}
      <H style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, fontSize: 16, color: t.text }}>Daily Essentials</H>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {ESSENTIALS.slice(0, 4).map((e, i) => (
          <Pressable key={e.id} onPress={() => actions.openProduct(e.id, ESSENTIALS)} style={{ width: '47.5%', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 10 }}>
            <Stripe data={stripe(i + 4, isDark)} radius={12} style={{ width: 44, height: 44 }} />
            <View style={{ flex: 1 }}>
              <TXT style={{ fontSize: 12.5, fontFamily: FONT.bodySemi, color: t.text }}>{e.name}</TXT>
              <TXT style={{ fontSize: 12.5, fontFamily: FONT.bodyBold, color: t.saffron, marginTop: 3 }}>₹{e.price}</TXT>
            </View>
          </Pressable>
        ))}
      </View>

      {/* nearby stores */}
      <H style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12, fontSize: 16, color: t.text }}>Nearby Pooja Stores</H>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {STORES.map((s, i) => (
          <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 12 }}>
            <Stripe data={stripe(i + 2, isDark)} radius={13} style={{ width: 46, height: 46 }} />
            <View style={{ flex: 1 }}>
              <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodySemi, color: t.text }}>{s.name}</TXT>
              <TXT style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>{s.distance} · {stars(s.rating)} · {s.eta} delivery</TXT>
            </View>
          </View>
        ))}
      </View>

      {/* featured priests */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }}>
        <H style={{ fontSize: 16, color: t.text }}>Featured Poojaris</H>
        <Pressable onPress={actions.go_priests}><TXT style={{ fontSize: 13, color: t.saffron, fontFamily: FONT.bodySemi }}>See all</TXT></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 6 }}>
        {PRIESTS.map((p, i) => (
          <Pressable key={p.id} onPress={() => actions.openPriest(p.id)} style={{ width: 150, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 18, padding: 14, alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: monoBg(i, t), marginBottom: 10, alignItems: 'center', justifyContent: 'center' }}>
              <H style={{ color: '#fff', fontSize: 15 }}>{initials(p.name)}</H>
            </View>
            <TXT style={{ fontSize: 12.5, fontFamily: FONT.bodySemi, color: t.text, textAlign: 'center', marginBottom: 3 }}>{p.name}</TXT>
            <TXT style={{ fontSize: 11, color: t.gold, marginBottom: 6 }}>{stars(p.rating)}</TXT>
            <TXT style={{ fontSize: 12, fontFamily: FONT.bodyBold, color: t.saffron }}>₹{p.fee}</TXT>
          </Pressable>
        ))}
      </ScrollView>

      {/* offers */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 12 }}>
        {offerCards.map((o) => (
          <View key={o.code} style={{ borderRadius: 18, padding: 16, backgroundColor: o.bg, borderWidth: 1, borderColor: t.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <H style={{ fontSize: 14.5, color: t.text }}>{o.title}</H>
              <TXT style={{ fontSize: 12.5, color: t.textMuted, marginTop: 3 }}>{o.desc}</TXT>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,.5)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9 }}>
              <TXT style={{ fontFamily: FONT.mono, fontSize: 12, color: t.maroon, fontWeight: '700' }}>{o.code}</TXT>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Categories({ t, state, actions, isDark }) {
  const active = CATEGORY_DEFS.find((c) => c.id === state.selectedCategory) || {};
  const allProducts = [...KITS, ...ESSENTIALS];
  const products = allProducts.filter((p) => p.cat === state.selectedCategory);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 14 }}>
        {CATEGORY_DEFS.map((c) => {
          const sel = state.selectedCategory === c.id;
          return (
            <Pressable key={c.id} onPress={() => actions.selectCategory(c.id)} style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: sel ? t.maroon : t.border, backgroundColor: sel ? t.maroon : t.surface }}>
              <TXT style={{ fontSize: 13, fontFamily: FONT.bodySemi, color: sel ? '#fff' : t.text }}>{c.name}</TXT>
            </Pressable>
          );
        })}
      </ScrollView>
      <H style={{ paddingHorizontal: 20, fontSize: 17, color: t.text, marginBottom: 14 }}>{active.name}</H>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {products.map((p, i) => (
          <Pressable key={p.id} onPress={() => actions.openProduct(p.id, allProducts)} style={{ width: '47%', backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 18, overflow: 'hidden' }}>
            <Stripe data={stripe(i, isDark)} style={{ height: 100 }} />
            <View style={{ padding: 11 }}>
              <TXT style={{ fontSize: 13, fontFamily: FONT.bodySemi, color: t.text, minHeight: 34 }}>{p.name}</TXT>
              <TXT style={{ fontFamily: FONT.bodyBold, fontSize: 14, color: t.text, marginTop: 6 }}>₹{p.price}</TXT>
            </View>
          </Pressable>
        ))}
        {products.length === 0 ? <TXT style={{ color: t.textMuted, padding: 8 }}>No products in this category yet.</TXT> : null}
      </View>
    </ScrollView>
  );
}

function Festival({ t, actions, isDark }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[t.maroon, t.maroonDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 190, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: -20, top: -20, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(212,175,55,.15)' }} />
      </LinearGradient>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <H style={{ fontSize: 24, color: t.text }}>Ganesh Chaturthi</H>
        <TXT style={{ fontSize: 13.5, color: t.textMuted, marginTop: 6 }}>Sept 6, 2026 · 10 days of celebration</TXT>
        <TXT style={{ fontSize: 14, color: t.text, lineHeight: 22, marginTop: 14 }}>Welcome Lord Ganesha home with a complete, temple-verified set of ritual items — sourced fresh and delivered same day.</TXT>
        <H style={{ fontSize: 15, color: t.text, marginTop: 22, marginBottom: 12 }}>Required Items</H>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          {REQUIRED_ITEMS.map((item) => (
            <View key={item} style={{ paddingHorizontal: 13, paddingVertical: 8, borderRadius: 11, backgroundColor: t.chipBg }}>
              <TXT style={{ fontSize: 12.5, color: t.text }}>{item}</TXT>
            </View>
          ))}
        </View>
        <Card t={t} style={{ marginTop: 22, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center', borderRadius: 18 }}>
          <Stripe data={stripe(0, isDark)} radius={14} style={{ width: 64, height: 64 }} />
          <View style={{ flex: 1 }}>
            <TXT style={{ fontFamily: FONT.bodyBold, fontSize: 14.5, color: t.text }}>Ganesh Puja Homam Samagri Kit</TXT>
            <TXT style={{ fontSize: 12.5, color: t.textMuted, marginTop: 3 }}>18 items from Pooja Samagri Excel list</TXT>
            <TXT style={{ fontFamily: FONT.bodyBold, fontSize: 15.5, color: t.text, marginTop: 6 }}>₹1999</TXT>
          </View>
        </Card>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Pressable onPress={actions.go_priests} style={{ flex: 1, padding: 15, borderRadius: 14, borderWidth: 1.5, borderColor: t.maroon, alignItems: 'center' }}>
            <TXT style={{ fontFamily: FONT.bodyBold, color: t.maroon, fontSize: 14 }}>Book Priest</TXT>
          </Pressable>
          <Pressable onPress={actions.addFestivalKitToCart} style={{ flex: 1, padding: 15, borderRadius: 14, backgroundColor: t.saffron, alignItems: 'center' }}>
            <TXT style={{ fontFamily: FONT.bodyBold, color: '#fff', fontSize: 14 }}>Add Kit to Cart</TXT>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function Product({ t, state, actions, isDark, currentProduct }) {
  const raw = currentProduct();
  const p = raw;
  const idx = p._idx;
  const store = STORES[idx % STORES.length];
  const qty = state.productQty || 1;
  const desc = p.mrp
    ? 'A thoughtfully curated, temple-verified set of items — fresh, complete and ready to use for your ceremony.'
    : 'Sourced fresh daily from verified local pooja stores, hygienically packed for same-day delivery.';
  const allProducts = [...KITS, ...ESSENTIALS];
  const related = allProducts.filter((x) => x.id !== p.id).slice(0, 4);
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <Stripe data={stripe(idx, isDark)} style={{ height: 230 }}>
          <View style={{ position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            {[0, 1, 2].map((i) => <Dot key={i} size={6} color={i === 0 ? t.gold : isDark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.15)'} />)}
          </View>
        </Stripe>
        <View style={{ padding: 20 }}>
          <TXT style={{ fontSize: 12, color: t.saffron, fontFamily: FONT.bodyBold, letterSpacing: 0.3 }}>{store.name}</TXT>
          <H style={{ fontSize: 21, color: t.text, marginVertical: 6 }}>{p.name}</H>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <TXT style={{ fontSize: 13, color: t.gold }}>{stars(p.rating || 4.7)}</TXT>
            <TXT style={{ fontSize: 12.5, color: t.textMuted }}>{p.reviews || 80 + idx * 13} reviews</TXT>
            <TXT style={{ fontSize: 12, color: t.textMuted }}>·</TXT>
            <TXT style={{ fontSize: 12.5, color: t.textMuted }}>Delivery in 35 min</TXT>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <H style={{ fontSize: 23, color: t.text }}>₹{p.price}</H>
            {p.mrp ? <TXT style={{ fontSize: 14, color: t.textMuted, textDecorationLine: 'line-through' }}>₹{p.mrp}</TXT> : null}
          </View>
          <TXT style={{ fontSize: 14, color: t.text, lineHeight: 22, marginBottom: 18 }}>{desc}</TXT>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <TXT style={{ fontSize: 13, fontFamily: FONT.bodySemi, color: t.text }}>Quantity</TXT>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Pressable onPress={actions.decQty}><TXT style={{ fontSize: 18, color: t.text }}>−</TXT></Pressable>
              <TXT style={{ minWidth: 14, textAlign: 'center', fontFamily: FONT.bodySemi, color: t.text }}>{qty}</TXT>
              <Pressable onPress={actions.incQty}><TXT style={{ fontSize: 18, color: t.text }}>+</TXT></Pressable>
            </View>
          </View>
          <H style={{ fontSize: 15, color: t.text, marginBottom: 12 }}>You may also like</H>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {related.map((r, i) => (
              <Pressable key={r.id} onPress={() => actions.openProduct(r.id, allProducts)} style={{ width: 120, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 15, overflow: 'hidden' }}>
                <Stripe data={stripe(i + 1, isDark)} style={{ height: 80 }} />
                <View style={{ padding: 9 }}>
                  <TXT style={{ fontSize: 11.5, fontFamily: FONT.bodySemi, color: t.text }}>{r.name}</TXT>
                  <TXT style={{ fontSize: 12, fontFamily: FONT.bodyBold, color: t.text, marginTop: 4 }}>₹{r.price}</TXT>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: t.bg, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22, borderTopWidth: 1, borderTopColor: t.border }}>
        <Pressable onPress={actions.addProductToCart} style={{ padding: 16, borderRadius: 14, backgroundColor: t.saffron, alignItems: 'center' }}>
          <TXT style={{ fontFamily: FONT.bodyBold, color: '#fff', fontSize: 15 }}>Add to Cart — ₹{p.price * qty}</TXT>
        </Pressable>
      </View>
    </View>
  );
}

function Cart({ t, state, actions }) {
  const cart = state.cart;
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = state.couponApplied ? Math.round(subtotal * 0.15) : 0;
  const afterDiscount = subtotal - discount;
  const delivery = cart.length === 0 ? 0 : afterDiscount > 999 ? 0 : 49;
  const total = afterDiscount + delivery;
  if (cart.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 14 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: t.chipBg }} />
        <H style={{ fontSize: 17, color: t.text }}>Your cart is empty</H>
        <TXT style={{ fontSize: 13.5, color: t.textMuted, textAlign: 'center' }}>Add pooja kits or daily essentials to get started</TXT>
        <Pressable onPress={actions.go_home} style={{ marginTop: 6, paddingHorizontal: 26, paddingVertical: 13, borderRadius: 13, backgroundColor: t.saffron }}>
          <TXT style={{ fontFamily: FONT.bodyBold, color: '#fff' }}>Browse Home</TXT>
        </Pressable>
      </View>
    );
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }} showsVerticalScrollIndicator={false}>
      {cart.map((item) => (
        <View key={item.id} style={{ flexDirection: 'row', gap: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 12, alignItems: 'center' }}>
          <Stripe data={item.stripe} radius={12} style={{ width: 56, height: 56 }} />
          <View style={{ flex: 1 }}>
            <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodySemi, color: t.text }}>{item.name}</TXT>
            <TXT style={{ fontSize: 11.5, color: t.textMuted, marginTop: 2 }}>{item.type === 'kit' ? 'Pooja Kit' : item.type === 'priest' ? 'Priest Booking' : 'Product'}</TXT>
            <TXT style={{ fontFamily: FONT.bodyBold, fontSize: 13.5, color: t.text, marginTop: 4 }}>₹{item.price}</TXT>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Pressable onPress={() => actions.decCartItem(item.id)}><TXT style={{ fontSize: 15, color: t.text }}>−</TXT></Pressable>
            <TXT style={{ fontSize: 13, fontFamily: FONT.bodySemi, color: t.text }}>{item.qty}</TXT>
            <Pressable onPress={() => actions.incCartItem(item.id)}><TXT style={{ fontSize: 15, color: t.text }}>+</TXT></Pressable>
          </View>
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
        <TextInput value={state.couponCode} onChangeText={actions.onCouponChange} placeholder="Enter coupon code" placeholderTextColor={t.textMuted}
          style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, color: t.text, fontSize: 13.5, fontFamily: FONT.body }} />
        <Pressable onPress={actions.applyCoupon} style={{ paddingHorizontal: 18, justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: t.maroon }}>
          <TXT style={{ fontFamily: FONT.bodyBold, color: t.maroon, fontSize: 13 }}>{state.couponApplied ? 'Remove' : 'Apply'}</TXT>
        </Pressable>
      </View>
      <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 16, marginTop: 6, gap: 9 }}>
        <Row label="Subtotal" value={`₹${subtotal}`} t={t} />
        {state.couponApplied ? <Row label="Coupon discount" value={`−₹${discount}`} t={t} valueColor={t.success} labelColor={t.success} /> : null}
        <Row label="Delivery charge" value={delivery === 0 ? 'FREE' : `₹${delivery}`} t={t} />
        <View style={{ height: 1, backgroundColor: t.border, marginVertical: 4 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <H style={{ fontSize: 15.5, color: t.text }}>Total</H>
          <H style={{ fontSize: 15.5, color: t.text }}>₹{total}</H>
        </View>
      </View>
      <Pressable onPress={actions.go_checkout} style={{ padding: 16, borderRadius: 14, backgroundColor: t.saffron, alignItems: 'center', marginTop: 6 }}>
        <TXT style={{ fontFamily: FONT.bodyBold, color: '#fff', fontSize: 15 }}>Proceed to Checkout</TXT>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value, t, valueColor, labelColor }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <TXT style={{ fontSize: 13.5, color: labelColor || t.textMuted }}>{label}</TXT>
      <TXT style={{ fontSize: 13.5, color: valueColor || t.text }}>{value}</TXT>
    </View>
  );
}

function Checkout({ t, state, actions }) {
  const cart = state.cart;
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = state.couponApplied ? Math.round(subtotal * 0.15) : 0;
  const afterDiscount = subtotal - discount;
  const delivery = cart.length === 0 ? 0 : afterDiscount > 999 ? 0 : 49;
  const total = afterDiscount + delivery;
  const Section = ({ title, items, selIdx, onSelect, radio }) => (
    <View>
      <H style={{ fontSize: 14.5, color: t.text, marginBottom: 10 }}>{title}</H>
      <View style={{ gap: radio ? 10 : 9 }}>
        {items.map((it, i) => {
          const sel = selIdx === i;
          return (
            <Pressable key={i} onPress={() => onSelect(i)} style={{ flexDirection: 'row', gap: 12, alignItems: radio ? 'flex-start' : 'center', justifyContent: radio ? 'flex-start' : 'space-between', padding: radio ? 14 : 13, paddingHorizontal: 14, borderRadius: radio ? 14 : 13, borderWidth: 1.5, borderColor: sel ? (radio ? t.maroon : t.saffron) : t.border, backgroundColor: t.surface }}>
              {radio ? (
                <>
                  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: sel ? t.maroon : t.textMuted, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}>
                    {sel ? <Dot size={9} color={t.maroon} /> : null}
                  </View>
                  <View>
                    <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodyBold, color: t.text }}>{it.label}</TXT>
                    <TXT style={{ fontSize: 12.5, color: t.textMuted, marginTop: 3 }}>{it.detail}</TXT>
                  </View>
                </>
              ) : (
                <>
                  <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodySemi, color: t.text }}>{it}</TXT>
                  {sel ? <TXT style={{ fontSize: 12, color: t.saffron, fontFamily: FONT.bodyBold }}>Selected</TXT> : null}
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 20 }} showsVerticalScrollIndicator={false}>
      <Section title="Delivery Address" items={ADDRESS_LIST} selIdx={state.addressIdx} onSelect={actions.setAddress} radio />
      <Section title="Delivery Slot" items={SLOT_LIST} selIdx={state.slotIdx} onSelect={actions.setSlot} />
      <Section title="Payment Method" items={PAYMENT_LIST} selIdx={state.paymentIdx} onSelect={actions.setPayment} />
      <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TXT style={{ fontSize: 13, color: t.textMuted }}>Order total</TXT>
          <TXT style={{ fontSize: 13, fontFamily: FONT.bodyBold, color: t.text }}>₹{total}</TXT>
        </View>
      </View>
      <Pressable onPress={actions.placeOrder} style={{ padding: 16, borderRadius: 14, backgroundColor: t.saffron, alignItems: 'center' }}>
        <TXT style={{ fontFamily: FONT.bodyBold, color: '#fff', fontSize: 15 }}>Place Order</TXT>
      </Pressable>
    </ScrollView>
  );
}

function Tracking({ t, state }) {
  const step = state.trackingStep;
  const eta = step >= 4 ? 'Delivered' : `${(4 - step) * 8} min`;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ marginHorizontal: 20, height: 170, borderRadius: 18, overflow: 'hidden', backgroundColor: t.chipBg, borderWidth: 1, borderColor: t.border }}>
        <View style={{ position: 'absolute', left: '30%', top: '60%', width: 12, height: 12, borderRadius: 6, backgroundColor: t.saffron }} />
        <View style={{ position: 'absolute', left: '70%', top: '30%', width: 10, height: 10, borderRadius: 5, backgroundColor: t.maroon }} />
        <TXT style={{ position: 'absolute', left: 8, top: 8, fontFamily: FONT.mono, fontSize: 10.5, color: t.textMuted, letterSpacing: 0.5 }}>LIVE MAP</TXT>
      </View>
      <View style={{ marginHorizontal: 20, marginTop: 14, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: t.surface, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 18 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.maroon, alignItems: 'center', justifyContent: 'center' }}><H style={{ color: '#fff' }}>RK</H></View>
        <View style={{ flex: 1 }}>
          <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodyBold, color: t.text }}>Ravi Kumar</TXT>
          <TXT style={{ fontSize: 12, color: t.textMuted }}>Delivery partner · Arriving in {eta}</TXT>
        </View>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: t.chipBg, alignItems: 'center', justifyContent: 'center' }}><TXT style={{ fontSize: 14 }}>☎</TXT></View>
      </View>
      <View style={{ padding: 24, paddingHorizontal: 20 }}>
        {TRACKING_STEPS.map((d, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: i <= step ? t.saffron : t.border }} />
              {i < TRACKING_STEPS.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 34, backgroundColor: i < step ? t.saffron : t.border }} /> : null}
            </View>
            <View style={{ paddingBottom: 30 }}>
              <TXT style={{ fontSize: 14, fontFamily: FONT.bodySemi, color: i <= step ? t.text : t.textMuted }}>{d.label}</TXT>
              <TXT style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{d.time}</TXT>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Priests({ t, actions }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 14 }} showsVerticalScrollIndicator={false}>
      {PRIESTS.map((p, i) => (
        <Pressable key={p.id} onPress={() => actions.openPriest(p.id)} style={{ flexDirection: 'row', gap: 14, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 18, padding: 14 }}>
          <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: monoBg(i, t), alignItems: 'center', justifyContent: 'center' }}>
            <H style={{ color: '#fff', fontSize: 18 }}>{initials(p.name)}</H>
          </View>
          <View style={{ flex: 1 }}>
            <TXT style={{ fontSize: 14.5, fontFamily: FONT.bodyBold, color: t.text }}>{p.name}</TXT>
            <TXT style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{p.exp} experience · {p.languages}</TXT>
            <TXT style={{ fontSize: 12, color: t.text, marginTop: 4 }}>{p.specialization}</TXT>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <TXT style={{ fontSize: 12, color: t.gold }}>{stars(p.rating)} ({p.reviews})</TXT>
              <TXT style={{ fontSize: 13, fontFamily: FONT.bodyBold, color: t.saffron }}>₹{p.fee}</TXT>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function PriestProfile({ t, state, actions }) {
  const p = PRIESTS.find((x) => x.id === state.selectedPriestId) || PRIESTS[0];
  const i = PRIESTS.indexOf(p);
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, alignItems: 'center' }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: monoBg(i, t), alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <H style={{ color: '#fff', fontSize: 28 }}>{initials(p.name)}</H>
          </View>
          <H style={{ fontSize: 20, color: t.text }}>{p.name}</H>
          <TXT style={{ fontSize: 13, color: t.textMuted, marginTop: 4, textAlign: 'center' }}>{p.exp} experience · {p.languages}</TXT>
          <TXT style={{ fontSize: 13.5, color: t.gold, marginTop: 8 }}>{stars(p.rating)} · {p.reviews} reviews</TXT>
        </View>
        <View style={{ padding: 20 }}>
          <H style={{ fontSize: 14.5, color: t.text, marginBottom: 8 }}>Biography</H>
          <TXT style={{ fontSize: 13.5, color: t.text, lineHeight: 22, marginBottom: 18 }}>{p.bio}</TXT>
          <H style={{ fontSize: 14.5, color: t.text, marginBottom: 10 }}>Ritual Expertise</H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {p.expertise.map((e) => (
              <View key={e} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: t.chipBg }}><TXT style={{ fontSize: 12, color: t.text }}>{e}</TXT></View>
            ))}
          </View>
          <H style={{ fontSize: 14.5, color: t.text, marginBottom: 10 }}>Availability</H>
          <TXT style={{ fontSize: 13.5, color: t.textMuted, marginBottom: 18 }}>Mon–Sat, 6:00 AM – 8:00 PM · Next slot in 2 hours</TXT>
          <H style={{ fontSize: 14.5, color: t.text, marginBottom: 10 }}>Reviews</H>
          <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 13 }}>
            <TXT style={{ fontSize: 12.5, color: t.gold, marginBottom: 5 }}>★★★★★</TXT>
            <TXT style={{ fontSize: 13, color: t.text, lineHeight: 20 }}>Very punctual and performed the Satyanarayan puja with complete authenticity. Highly recommend.</TXT>
          </View>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: t.bg, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22, borderTopWidth: 1, borderTopColor: t.border, flexDirection: 'row', gap: 12 }}>
        <Pressable onPress={actions.go_bookOnline} style={{ flex: 1, padding: 15, borderRadius: 14, borderWidth: 1.5, borderColor: t.maroon, alignItems: 'center' }}>
          <TXT style={{ fontFamily: FONT.bodyBold, color: t.maroon, fontSize: 13.5 }}>Book Online</TXT>
        </Pressable>
        <Pressable onPress={actions.go_bookHome} style={{ flex: 1, padding: 15, borderRadius: 14, backgroundColor: t.saffron, alignItems: 'center' }}>
          <TXT style={{ fontFamily: FONT.bodyBold, color: '#fff', fontSize: 13.5 }}>Book Home Visit</TXT>
        </Pressable>
      </View>
    </View>
  );
}

function Booking({ t, state, actions }) {
  const p = PRIESTS.find((x) => x.id === state.selectedPriestId) || PRIESTS[0];
  const modeLabel = state.bookingMode === 'online' ? 'Online Consultation' : 'Home Visit';
  const today = new Date(2026, 7, 1);
  const dates = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i);
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d.getDate() };
  });
  const Chip = ({ label, sel, onPress, small }) => (
    <Pressable onPress={onPress} style={{ paddingHorizontal: small ? 14 : 0, paddingVertical: small ? 9 : 11, borderRadius: 11, borderWidth: 1.5, borderColor: sel ? t.saffron : t.border, backgroundColor: sel ? t.chipBg : t.surface, alignItems: 'center', flexGrow: small ? 0 : 1, flexBasis: small ? 'auto' : '30%' }}>
      <TXT style={{ fontSize: 12.5, fontFamily: FONT.bodySemi, color: t.text }}>{label}</TXT>
    </Pressable>
  );
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 20 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: t.chipBg, borderRadius: 14, padding: 13, paddingHorizontal: 16 }}>
        <TXT style={{ fontSize: 13, color: t.text }}>Booking <TXT style={{ fontFamily: FONT.bodyBold }}>{p.name}</TXT> for a <TXT style={{ fontFamily: FONT.bodyBold }}>{modeLabel}</TXT></TXT>
      </View>
      <View>
        <H style={{ fontSize: 14.5, color: t.text, marginBottom: 10 }}>Select Date</H>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {dates.map((d, i) => {
            const sel = state.bookingDateIdx === i;
            return (
              <Pressable key={i} onPress={() => actions.selectBookingDate(i)} style={{ width: 56, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, borderColor: sel ? t.saffron : t.border, backgroundColor: sel ? t.chipBg : t.surface, alignItems: 'center' }}>
                <TXT style={{ fontSize: 11, color: sel ? t.saffron : t.textMuted }}>{d.day}</TXT>
                <TXT style={{ fontSize: 15, fontFamily: FONT.bodyBold, color: t.text, marginTop: 2 }}>{d.date}</TXT>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View>
        <H style={{ fontSize: 14.5, color: t.text, marginBottom: 10 }}>Select Time</H>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          {BOOKING_TIMES.map((label, i) => <Chip key={i} label={label} sel={state.bookingTimeIdx === i} onPress={() => actions.selectBookingTime(i)} />)}
        </View>
      </View>
      <View>
        <H style={{ fontSize: 14.5, color: t.text, marginBottom: 10 }}>Ritual Type</H>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          {RITUAL_OPTIONS.map((label, i) => <Chip key={i} small label={label} sel={state.bookingRitualIdx === i} onPress={() => actions.selectRitual(i)} />)}
        </View>
      </View>
      {state.bookingMode === 'home' ? (
        <View>
          <H style={{ fontSize: 14.5, color: t.text, marginBottom: 10 }}>Address</H>
          <View style={{ backgroundColor: t.surface, borderWidth: 1.5, borderColor: t.maroon, borderRadius: 14, padding: 13, paddingHorizontal: 14 }}>
            <TXT style={{ fontSize: 13, color: t.text }}>Home · 4th Cross, Malleshwaram, Bengaluru</TXT>
          </View>
        </View>
      ) : null}
      <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <TXT style={{ fontSize: 13.5, color: t.textMuted }}>Consultation Fee</TXT>
        <TXT style={{ fontSize: 15, fontFamily: FONT.bodyBold, color: t.text }}>₹{p.fee}</TXT>
      </View>
      <Pressable onPress={actions.confirmBooking} style={{ padding: 16, borderRadius: 14, backgroundColor: t.saffron, alignItems: 'center' }}>
        <TXT style={{ fontFamily: FONT.bodyBold, color: '#fff', fontSize: 15 }}>{state.bookingMode === 'online' ? 'Confirm & Join Call' : 'Confirm Booking'}</TXT>
      </Pressable>
    </ScrollView>
  );
}

function Video({ t, state, actions }) {
  const p = PRIESTS.find((x) => x.id === state.selectedPriestId) || PRIESTS[0];
  const i = PRIESTS.indexOf(p);
  const mm = String(Math.floor(state.callSeconds / 60)).padStart(2, '0');
  const ss = String(state.callSeconds % 60).padStart(2, '0');
  const CircleBtn = ({ label, onPress, bg, fg }) => (
    <Pressable onPress={onPress} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <TXT style={{ color: fg, fontSize: 11.5, fontFamily: FONT.bodyBold }}>{label}</TXT>
    </Pressable>
  );
  return (
    <View style={{ flex: 1, backgroundColor: '#12100f' }}>
      <LinearGradient colors={['#241a16', '#0e0b0a']} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }} style={{ ...StyleFill(), alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: monoBg(i, t), alignItems: 'center', justifyContent: 'center' }}>
          <H style={{ color: '#fff', fontSize: 36 }}>{initials(p.name)}</H>
        </View>
      </LinearGradient>
      <View style={{ position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <H style={{ color: '#fff', fontFamily: FONT.headSemi, fontSize: 15 }}>{p.name}</H>
        <TXT style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, fontFamily: FONT.mono }}>{mm}:{ss}</TXT>
      </View>
      <View style={{ position: 'absolute', top: 90, right: 20, width: 78, height: 110, borderRadius: 14, backgroundColor: '#3a2a22', borderWidth: 2, borderColor: 'rgba(255,255,255,.2)', alignItems: 'center', justifyContent: 'center' }}>
        <TXT style={{ color: 'rgba(255,255,255,.5)', fontSize: 10, fontFamily: FONT.mono }}>YOU</TXT>
      </View>
      {state.chatOpen ? (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 150, top: 230, backgroundColor: 'rgba(20,15,13,.85)', borderRadius: 16, padding: 14, gap: 10 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.12)', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 11, maxWidth: '80%' }}>
            <TXT style={{ color: '#fff', fontSize: 12.5 }}>Namaste! Please keep the Panchamrit ready before we begin.</TXT>
          </View>
          <View style={{ alignSelf: 'flex-end', backgroundColor: t.saffron, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 11, maxWidth: '80%' }}>
            <TXT style={{ color: '#fff', fontSize: 12.5 }}>Sure, it's ready. Thank you Panditji.</TXT>
          </View>
        </View>
      ) : null}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 34, flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
        <CircleBtn label={state.muted ? 'Unmute' : 'Mute'} onPress={actions.toggleMute} bg={state.muted ? '#fff' : 'rgba(255,255,255,.15)'} fg={state.muted ? '#12100f' : '#fff'} />
        <CircleBtn label={state.videoOff ? 'Cam On' : 'Cam Off'} onPress={actions.toggleVideoOff} bg={state.videoOff ? '#fff' : 'rgba(255,255,255,.15)'} fg={state.videoOff ? '#12100f' : '#fff'} />
        <CircleBtn label="Chat" onPress={actions.toggleChat} bg="rgba(255,255,255,.15)" fg="#fff" />
        <CircleBtn label="End" onPress={actions.endCall} bg="#D64545" fg="#fff" />
      </View>
    </View>
  );
}

function StyleFill() {
  return { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
}

function Profile({ t, isDark, actions }) {
  const rows = [
    { label: 'Personal Details', onPress: () => actions.openProfileSection('personalDetails') },
    { label: 'Saved Addresses', onPress: () => actions.openProfileSection('addresses') },
    { label: 'Family Members', onPress: () => actions.openProfileSection('family') },
    { label: 'Order History', onPress: () => actions.openProfileSection('orderHistory') },
    { label: 'Priest Booking History', onPress: () => actions.openProfileSection('priestHistory') },
    { label: 'Notifications', onPress: actions.go_notifications },
    { label: 'Wishlist', onPress: () => actions.go('wishlist') },
    { label: 'Support', onPress: () => actions.openProfileSection('support') },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: t.maroon, alignItems: 'center', justifyContent: 'center' }}><H style={{ color: '#fff', fontSize: 20 }}>AS</H></View>
        <View style={{ flex: 1 }}>
          <H style={{ fontSize: 17, color: t.text }}>Aarav Sharma</H>
          <TXT style={{ fontSize: 12.5, color: t.textMuted, marginTop: 2 }}>+91 98765 43210</TXT>
        </View>
        <Pressable style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 8 }}>
          <TXT style={{ fontSize: 12, fontFamily: FONT.bodySemi, color: t.text }}>Edit</TXT>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {rows.map((row) => (
          <Pressable key={row.label} onPress={row.onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 16, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 15 }}>
            <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodyMed, color: t.text }}>{row.label}</TXT>
            <TXT style={{ fontSize: 14, color: t.textMuted }}>›</TXT>
          </Pressable>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 16, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 15, marginTop: 4 }}>
          <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodyMed, color: t.text }}>Dark Mode</TXT>
          <Pressable onPress={actions.toggleTheme} style={{ width: 46, height: 26, borderRadius: 13, padding: 3, backgroundColor: isDark ? t.saffron : t.border, alignItems: isDark ? 'flex-end' : 'flex-start' }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
          </Pressable>
        </View>
        <Pressable onPress={actions.logout} style={{ marginTop: 10, padding: 15, borderRadius: 15, borderWidth: 1.5, borderColor: t.maroon, alignItems: 'center' }}>
          <TXT style={{ fontFamily: FONT.bodyBold, color: t.maroon, fontSize: 13.5 }}>Log Out</TXT>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ProfileDetail({ t, state }) {
  const sec = state.profileSection;
  const Info = ({ label, value }) => (
    <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 14 }}>
      <TXT style={{ fontSize: 11.5, color: t.textMuted }}>{label}</TXT>
      <TXT style={{ fontSize: 14, color: t.text, fontFamily: FONT.bodySemi, marginTop: 4 }}>{value}</TXT>
    </View>
  );
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }} showsVerticalScrollIndicator={false}>
      {sec === 'personalDetails' && (
        <>
          <Info label="Full Name" value="Aarav Sharma" />
          <Info label="Email" value="aarav.sharma@gmail.com" />
          <Info label="Date of Birth" value="14 March 1990" />
        </>
      )}
      {sec === 'addresses' && ADDRESS_LIST.map((a) => (
        <View key={a.label} style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 14 }}>
          <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodyBold, color: t.text }}>{a.label}</TXT>
          <TXT style={{ fontSize: 12.5, color: t.textMuted, marginTop: 4 }}>{a.detail}</TXT>
        </View>
      ))}
      {sec === 'family' && FAMILY.map((f) => (
        <View key={f.name} style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 14 }}>
          <TXT style={{ fontSize: 13.5, color: t.text }}><TXT style={{ fontFamily: FONT.bodyBold }}>{f.name}</TXT> <TXT style={{ color: t.textMuted, fontSize: 12 }}>· {f.relation}</TXT></TXT>
          <TXT style={{ fontSize: 12.5, color: t.textMuted, marginTop: 6 }}>Gotram: {f.gotram} · Nakshatram: {f.nakshatram}</TXT>
        </View>
      ))}
      {sec === 'orderHistory' && ORDER_HISTORY.map((o, i) => (
        <View key={i} style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View><TXT style={{ fontSize: 13.5, fontFamily: FONT.bodyBold, color: t.text }}>{o.name}</TXT><TXT style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>{o.date}</TXT></View>
          <View style={{ alignItems: 'flex-end' }}><TXT style={{ fontSize: 13, fontFamily: FONT.bodyBold, color: t.text }}>₹{o.amount}</TXT><TXT style={{ fontSize: 11.5, color: t.success, marginTop: 3 }}>{o.status}</TXT></View>
        </View>
      ))}
      {sec === 'priestHistory' && PRIEST_HISTORY.map((b, i) => (
        <View key={i} style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 14 }}>
          <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodyBold, color: t.text }}>{b.priest}</TXT>
          <TXT style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>{b.ritual} · {b.date}</TXT>
        </View>
      ))}
      {sec === 'support' && (
        <>
          <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 16 }}>
            <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodyBold, color: t.text }}>Chat with Support</TXT>
            <TXT style={{ fontSize: 12.5, color: t.textMuted, marginTop: 4 }}>Avg response time: 5 minutes</TXT>
          </View>
          <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 16 }}>
            <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodyBold, color: t.text }}>Call Us</TXT>
            <TXT style={{ fontSize: 12.5, color: t.textMuted, marginTop: 4 }}>1800-123-4567 (Toll Free)</TXT>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Notifications({ t, isDark }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 10 }} showsVerticalScrollIndicator={false}>
      {NOTIFICATIONS.map((n, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 15, padding: 13, paddingHorizontal: 14 }}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: i % 2 === 0 ? t.chipBg : isDark ? 'rgba(255,107,0,.15)' : 'rgba(255,107,0,.12)' }} />
          <View style={{ flex: 1 }}>
            <TXT style={{ fontSize: 13.5, fontFamily: FONT.bodySemi, color: t.text }}>{n.title}</TXT>
            <TXT style={{ fontSize: 12.5, color: t.textMuted, marginTop: 3, lineHeight: 18 }}>{n.body}</TXT>
            <TXT style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>{n.time}</TXT>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function Wishlist({ t, state, actions, isDark }) {
  const items = [...KITS, ...ESSENTIALS].filter((p) => state.wishlist.includes(p.id));
  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 14 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: t.chipBg }} />
        <H style={{ fontSize: 17, color: t.text }}>No items saved yet</H>
        <TXT style={{ fontSize: 13.5, color: t.textMuted, textAlign: 'center' }}>Tap the heart on any item to save it here</TXT>
      </View>
    );
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {items.map((w, i) => (
          <View key={w.id} style={{ width: '47%', backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 18, overflow: 'hidden' }}>
            <Stripe data={stripe(i, isDark)} style={{ height: 100 }}>
              <Pressable onPress={() => actions.toggleWishlist(w.id)} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.85)', alignItems: 'center', justifyContent: 'center' }}>
                <TXT style={{ color: t.maroon, fontSize: 14 }}>×</TXT>
              </Pressable>
            </Stripe>
            <View style={{ padding: 11 }}>
              <TXT style={{ fontSize: 13, fontFamily: FONT.bodySemi, color: t.text }}>{w.name}</TXT>
              <TXT style={{ fontSize: 14, fontFamily: FONT.bodyBold, color: t.text, marginTop: 6 }}>₹{w.price}</TXT>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ---------------- router ---------------- */

const TITLES = {
  categories: 'Categories', festival: 'Festival', cart: 'My Cart', checkout: 'Checkout',
  tracking: 'Track Order', priests: 'Poojaris', priestProfile: 'Priest Profile', booking: 'Book Priest',
  profile: 'Profile', notifications: 'Notifications', wishlist: 'Wishlist',
};
const PROFILE_TITLES = {
  personalDetails: 'Personal Details', addresses: 'Saved Addresses', family: 'Family Members',
  orderHistory: 'Order History', priestHistory: 'Priest Booking History', support: 'Support',
};

// Screens that render the standard back-header (mirrors showStdHeader in the dc.html
// design). Tab screens (home/priests/profile) carry their own in-screen headers, and
// splash/onboarding/login/otp/video are full-bleed — so they are intentionally excluded.
const HEADER_SCREENS = [
  'categories', 'festival', 'product', 'cart', 'checkout', 'tracking',
  'priestProfile', 'booking', 'profileDetail', 'notifications', 'wishlist',
];

export function Screen({ state, actions, isDark, currentProduct, t }) {
  const s = state.screen;
  const props = { t, state, actions, isDark, currentProduct };

  const bodyMap = {
    splash: <Splash {...props} />,
    onboarding: <Onboarding {...props} />,
    login: <Login {...props} />,
    otp: <Otp {...props} />,
    home: <Home {...props} />,
    categories: <Categories {...props} />,
    festival: <Festival {...props} />,
    product: <Product {...props} />,
    cart: <Cart {...props} />,
    checkout: <Checkout {...props} />,
    tracking: <Tracking {...props} />,
    priests: <Priests {...props} />,
    priestProfile: <PriestProfile {...props} />,
    booking: <Booking {...props} />,
    video: <Video {...props} />,
    profile: <Profile {...props} />,
    profileDetail: <ProfileDetail {...props} />,
    notifications: <Notifications {...props} />,
    wishlist: <Wishlist {...props} />,
  };

  const showBottomNav = TABS.includes(s);
  const showBack = !TABS.includes(s) && !['splash', 'onboarding', 'login', 'otp', 'video'].includes(s);
  const showHeader = HEADER_SCREENS.includes(s) || s === 'categories';
  let title = TITLES[s] || '';
  if (s === 'product') title = currentProduct().name;
  if (s === 'profileDetail') title = PROFILE_TITLES[state.profileSection] || 'Profile';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? <Header t={t} title={title} showBack={showBack} onBack={actions.back} /> : null}
      <View style={{ flex: 1 }}>{bodyMap[s]}</View>
      {showBottomNav ? <BottomNav t={t} screen={s} actions={actions} /> : null}
    </View>
  );
}
