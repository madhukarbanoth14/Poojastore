import 'package:firebase_core/firebase_core.dart';

class AppConfig {
  const AppConfig._();

  /// Override with `--dart-define=API_BASE_URL=...` for local/dev.
  /// Default targets staging HTTPS so accidental release builds are not localhost.
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://pooja-api-production-tcjernzh5a-el.a.run.app/api/v1',
  );

  /// Dev/test only. Must be false for release/store builds.
  /// When true, client may call `/payments/:id/mock-confirm` after checkout.
  static const allowMockPayments = bool.fromEnvironment(
    'ALLOW_MOCK_PAYMENTS',
    defaultValue: false,
  );

  /// When true, social login may fall back to subject-only (staging/dev API).
  /// Must be false for production store builds.
  static const allowDemoSocial = bool.fromEnvironment(
    'ALLOW_DEMO_SOCIAL',
    defaultValue: false,
  );

  /// Google OAuth web client ID (serverClientId) required for ID tokens on Android.
  static const googleServerClientId = String.fromEnvironment(
    'GOOGLE_SERVER_CLIENT_ID',
    defaultValue: '',
  );

  /// Agora RTC App ID (safe to ship in the client).
  static const agoraAppId = String.fromEnvironment(
    'AGORA_APP_ID',
    defaultValue: '7e9a244ee350427f82d060d70e0bb958',
  );

  /// Optional temporary/testing token. Leave empty for App ID-only projects.
  /// Production must mint tokens on the server (never embed App Certificate).
  static const agoraToken = String.fromEnvironment(
    'AGORA_TOKEN',
    defaultValue: '',
  );

  /// Enable Firebase push notifications (requires dart-defines below).
  static const enablePushNotifications = bool.fromEnvironment(
    'ENABLE_PUSH_NOTIFICATIONS',
    defaultValue: false,
  );

  static const firebaseApiKey = String.fromEnvironment(
    'FIREBASE_API_KEY',
    defaultValue: '',
  );

  static const firebaseAppId = String.fromEnvironment(
    'FIREBASE_APP_ID',
    defaultValue: '',
  );

  static const firebaseMessagingSenderId = String.fromEnvironment(
    'FIREBASE_MESSAGING_SENDER_ID',
    defaultValue: '',
  );

  static const firebaseProjectId = String.fromEnvironment(
    'FIREBASE_PROJECT_ID',
    defaultValue: '',
  );

  static FirebaseOptions? get firebaseOptions {
    if (!enablePushNotifications) return null;
    if (firebaseApiKey.isEmpty ||
        firebaseAppId.isEmpty ||
        firebaseMessagingSenderId.isEmpty ||
        firebaseProjectId.isEmpty) {
      return null;
    }
    return FirebaseOptions(
      apiKey: firebaseApiKey,
      appId: firebaseAppId,
      messagingSenderId: firebaseMessagingSenderId,
      projectId: firebaseProjectId,
    );
  }
}
