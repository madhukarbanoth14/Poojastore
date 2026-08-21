import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT } from './theme';

// Diagonal repeating-stripe placeholder, faithful to the web design's
// repeating-linear-gradient(45deg,...) used for product/kit imagery.
export function Stripe({ data, style, radius = 0, children }) {
  const { bar, paper } = data || { bar: '#eee', paper: '#fafafa' };
  return (
    <View style={[{ backgroundColor: paper, overflow: 'hidden' }, style, radius ? { borderRadius: radius } : null]}>
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: 26 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: -140 + i * 28,
              top: -60,
              width: 14,
              height: 400,
              backgroundColor: bar,
              transform: [{ rotate: '45deg' }],
            }}
          />
        ))}
      </View>
      {children}
    </View>
  );
}

// Small diya (oil lamp) flame teardrop used in splash / login mark.
export function DiyaFlame({ size = 26, color = '#4E1119' }) {
  return (
    <View
      style={{
        width: size,
        height: size * 1.46,
        borderTopLeftRadius: size,
        borderTopRightRadius: size,
        borderBottomLeftRadius: size * 0.55,
        borderBottomRightRadius: size * 0.55,
        backgroundColor: color,
        transform: [{ rotate: '180deg' }],
      }}
    />
  );
}

// Row of little triangular toran flags (splash / onboarding top border).
export function Flags({ colors, big = false }) {
  const w = big ? 9 : 7;
  const h = big ? 16 : 12;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      {colors.map((c, i) => (
        <View
          key={i}
          style={{
            width: 0,
            height: 0,
            marginHorizontal: 1,
            borderLeftWidth: w,
            borderRightWidth: w,
            borderTopWidth: h,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: c,
          }}
        />
      ))}
    </View>
  );
}

export function Dot({ size = 8, color, style }) {
  return <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />;
}

// Text helpers bound to the Poppins/Inter families.
export function H({ style, children, ...p }) {
  return <Text {...p} style={[{ fontFamily: FONT.head }, style]}>{children}</Text>;
}
export function TXT({ style, children, ...p }) {
  return <Text {...p} style={[{ fontFamily: FONT.body }, style]}>{children}</Text>;
}
