// Ported from Pooja Store.dc.html THEMES + stripe helpers.

export const THEMES = {
  light: {
    bg: '#FBF7F2', surface: '#FFFFFF', text: '#2A1810', textMuted: '#8A7568',
    textDark: '#000000', border: 'rgba(122,31,43,0.10)', saffron: '#FF6B00',
    gold: '#B8912A', maroon: '#7A1F2B', maroonDeep: '#4E1119', chipBg: '#F5EBDD',
    success: '#2E7D46',
  },
  dark: {
    bg: '#1B1310', surface: '#241A16', text: '#F5EBE2', textMuted: '#B39A8C',
    textDark: '#000000', border: 'rgba(212,175,55,0.18)', saffron: '#FF8A47',
    gold: '#E3C46B', maroon: '#D97583', maroonDeep: '#5A171F', chipBg: '#2E211B',
    success: '#4CAF6D',
  },
};

// The web design uses repeating-linear-gradient stripe placeholders for imagery.
// In RN we expose the base tint + underlying paper color so a <Stripe> component
// can render the diagonal bars faithfully.
const STRIPES_LIGHT = ['#FFE8D1', '#F6E3B4', '#F3D9DC', '#E7E2D6'];
const STRIPES_DARK = ['#3A2A18', '#3C331A', '#3A2226', '#332C22'];

export function stripe(idx, isDark) {
  const arr = isDark ? STRIPES_DARK : STRIPES_LIGHT;
  const bar = arr[((idx % arr.length) + arr.length) % arr.length];
  const paper = isDark ? '#241A16' : '#FBF3E3';
  return { bar, paper };
}

export const outer = (isDark) => ({
  bg: isDark ? '#0d0a09' : '#EDE7DD',
  text: isDark ? '#fff' : '#000',
  frameRing: isDark ? '#000' : 'rgba(0,0,0,.06)',
});

export function monoBg(seed, t) {
  const palette = [t.saffron, t.maroon, t.gold];
  return palette[seed % palette.length];
}

export function stars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

export function initials(name) {
  const parts = name.replace('Pandit ', '').split(' ');
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

// Font family names registered via @expo-google-fonts in App.js
export const FONT = {
  head: 'Poppins_700Bold',
  headSemi: 'Poppins_600SemiBold',
  body: 'Inter_400Regular',
  bodyMed: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  mono: 'monospace',
};
