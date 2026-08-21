import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _localeKey = 'app_locale';

class LocaleController extends StateNotifier<Locale> {
  LocaleController(this._storage) : super(const Locale('en')) {
    _restore();
  }

  final FlutterSecureStorage _storage;

  Future<void> _restore() async {
    final code = await _storage.read(key: _localeKey);
    if (code == 'te' || code == 'en') {
      state = Locale(code!);
    }
  }

  Future<void> setLanguage(String code) async {
    final next = code == 'te' ? 'te' : 'en';
    state = Locale(next);
    await _storage.write(key: _localeKey, value: next);
  }
}

final localeControllerProvider =
    StateNotifierProvider<LocaleController, Locale>((ref) {
  return LocaleController(const FlutterSecureStorage());
});
