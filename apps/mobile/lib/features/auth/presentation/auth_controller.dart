import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/i18n/locale_controller.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/fallback_dns.dart';
import '../data/auth_repository_impl.dart';
import '../domain/auth_repository.dart';
import '../domain/auth_user.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  final locale = ref.watch(localeControllerProvider);
  return ApiClient(localeCode: locale.languageCode);
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(apiClientProvider));
});

class AuthState {
  const AuthState({
    this.user,
    this.loading = false,
    this.error,
    this.debugOtp,
    this.bootstrapping = true,
  });

  final AuthUser? user;
  final bool loading;
  final String? error;
  final String? debugOtp;
  final bool bootstrapping;

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    AuthUser? user,
    bool? loading,
    String? error,
    String? debugOtp,
    bool? bootstrapping,
    bool clearUser = false,
    bool clearError = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      loading: loading ?? this.loading,
      error: clearError ? null : (error ?? this.error),
      debugOtp: debugOtp ?? this.debugOtp,
      bootstrapping: bootstrapping ?? this.bootstrapping,
    );
  }
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repository) : super(const AuthState()) {
    _bootstrap();
  }

  final AuthRepository _repository;

  Future<void> _bootstrap() async {
    final user = await _repository.restoreSession();
    state = state.copyWith(
      user: user,
      bootstrapping: false,
      clearUser: user == null,
    );
  }

  Future<bool> requestOtp({
    required String countryCode,
    required String phone,
  }) async {
    state = state.copyWith(loading: true, clearError: true, debugOtp: null);
    try {
      final otp = await _repository.requestOtp(
        countryCode: countryCode,
        phone: phone,
      );
      state = state.copyWith(loading: false, debugOtp: otp);
      return true;
    } catch (error) {
      state = state.copyWith(loading: false, error: friendlyNetworkError(error));
      return false;
    }
  }

  Future<bool> verifyOtp({
    required String countryCode,
    required String phone,
    required String code,
    String? fullName,
    String? preferredLanguage,
  }) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final session = await _repository.verifyOtp(
        countryCode: countryCode,
        phone: phone,
        code: code,
        fullName: fullName,
        preferredLanguage: preferredLanguage,
      );
      state = state.copyWith(loading: false, user: session.user);
      return true;
    } catch (error) {
      state = state.copyWith(loading: false, error: friendlyNetworkError(error));
      return false;
    }
  }

  Future<bool> continueWithSocial(String provider) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      const storage = FlutterSecureStorage();
      final key = 'social_subject_$provider';
      var subject = await storage.read(key: key);
      if (subject == null || subject.isEmpty) {
        subject =
            'ps-${provider.toLowerCase()}-${DateTime.now().microsecondsSinceEpoch}';
        await storage.write(key: key, value: subject);
      }
      final session = await _repository.socialLogin(
        provider: provider,
        subject: subject,
        fullName: provider == 'APPLE' ? 'Apple Devotee' : 'Google Devotee',
      );
      state = state.copyWith(loading: false, user: session.user);
      return true;
    } catch (error) {
      state = state.copyWith(loading: false, error: friendlyNetworkError(error));
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState(bootstrapping: false);
  }

  Future<void> updatePreferredLanguage(String language) async {
    if (!state.isAuthenticated) return;
    try {
      await _repository.updatePreferredLanguage(language);
    } catch (_) {
      // Locale still applies locally.
    }
  }

  Future<void> updateProfile({String? fullName, String? email}) async {
    final user = await _repository.updateProfile(
      fullName: fullName,
      email: email,
    );
    state = state.copyWith(user: user);
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(ref.watch(authRepositoryProvider));
});
