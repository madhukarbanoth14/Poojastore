import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/app_config.dart';
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
    this.bootstrapping = true,
  });

  final AuthUser? user;
  final bool loading;
  final String? error;
  final bool bootstrapping;

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    AuthUser? user,
    bool? loading,
    String? error,
    bool? bootstrapping,
    bool clearUser = false,
    bool clearError = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      loading: loading ?? this.loading,
      error: clearError ? null : (error ?? this.error),
      bootstrapping: bootstrapping ?? this.bootstrapping,
    );
  }
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repository) : super(const AuthState()) {
    _bootstrap();
  }

  AuthRepository _repository;

  /// Swap repository when ApiClient/locale changes without clearing the session.
  void attachRepository(AuthRepository repository) {
    _repository = repository;
  }

  Future<void> _bootstrap() async {
    final user = await _repository.restoreSession();
    state = state.copyWith(
      user: user,
      bootstrapping: false,
      clearUser: user == null,
    );
  }

  Future<bool> login({
    required String email,
    required String password,
    String? preferredLanguage,
  }) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final session = await _repository.login(
        email: email,
        password: password,
        preferredLanguage: preferredLanguage,
      );
      state = state.copyWith(loading: false, user: session.user);
      return true;
    } catch (error) {
      state = state.copyWith(loading: false, error: friendlyNetworkError(error));
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String countryCode,
    required String phone,
    String? fullName,
    String? preferredLanguage,
  }) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final session = await _repository.register(
        email: email,
        password: password,
        countryCode: countryCode,
        phone: phone,
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

  /// Native Google / Apple path. Prefer [idToken]; subject-only only when
  /// [AppConfig.allowDemoSocial] is true (staging/dev).
  Future<bool> socialLogin({
    required String provider,
    String? idToken,
    String? subject,
    String? email,
    String? fullName,
    String? preferredLanguage,
  }) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final hasToken = idToken != null && idToken.isNotEmpty;
      final hasSubject = subject != null && subject.isNotEmpty;
      if (!hasToken && !AppConfig.allowDemoSocial) {
        state = state.copyWith(
          loading: false,
          error: provider == 'APPLE'
              ? 'Apple Sign-In is not configured. Use email and password.'
              : 'Google Sign-In is not configured. Use email and password.',
        );
        return false;
      }
      if (!hasToken && !hasSubject) {
        state = state.copyWith(
          loading: false,
          error: 'Social sign-in did not return credentials.',
        );
        return false;
      }
      final session = await _repository.socialLogin(
        provider: provider,
        idToken: idToken,
        subject: hasToken ? null : subject,
        email: email,
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

  Future<void> updateProfile({String? fullName, String? email, String? phone}) async {
    final user = await _repository.updateProfile(
      fullName: fullName,
      email: email,
      phone: phone,
    );
    state = state.copyWith(user: user);
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  ref.keepAlive();
  // Use read (not watch) so locale/ApiClient rebuilds do not recreate AuthController
  // and wipe the in-memory session (that was forcing a second login after OTP).
  final controller = AuthController(ref.read(authRepositoryProvider));
  ref.listen<AuthRepository>(authRepositoryProvider, (_, next) {
    controller.attachRepository(next);
  });
  return controller;
});
