import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _themeKey = 'ps_theme';

class ThemeController extends StateNotifier<ThemeMode> {
  ThemeController(this._storage) : super(ThemeMode.light) {
    _restore();
  }

  final FlutterSecureStorage _storage;

  Future<void> _restore() async {
    final value = await _storage.read(key: _themeKey);
    if (value == 'dark') state = ThemeMode.dark;
  }

  bool get isDark => state == ThemeMode.dark;

  Future<void> toggle() async {
    final next = isDark ? ThemeMode.light : ThemeMode.dark;
    state = next;
    await _storage.write(
      key: _themeKey,
      value: next == ThemeMode.dark ? 'dark' : 'light',
    );
  }
}

final themeControllerProvider =
    StateNotifierProvider<ThemeController, ThemeMode>((ref) {
  return ThemeController(const FlutterSecureStorage());
});
