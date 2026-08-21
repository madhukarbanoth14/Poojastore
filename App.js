import React from 'react';
import { View, ActivityIndicator, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useApp } from './src/store';
import { THEMES } from './src/theme';
import { Screen } from './src/screens';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { state, actions, isDark, currentProduct } = useApp();
  const t = THEMES[state.theme];

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: THEMES.light.maroonDeep }}>
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

  // Splash and video are full-bleed (own dark backgrounds).
  const fullBleed = ['splash', 'video'].includes(state.screen);
  const topBg = state.screen === 'video' ? '#12100f' : state.screen === 'splash' ? t.maroon : t.bg;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: topBg, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
      <StatusBar style={fullBleed || isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <Screen state={state} actions={actions} isDark={isDark} currentProduct={currentProduct} t={t} />
      </View>
    </SafeAreaView>
  );
}
