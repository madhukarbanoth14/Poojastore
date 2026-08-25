class AppConfig {
  const AppConfig._();

  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3000/api/v1',
  );

  /// Dev/test only. Must be false for release/store builds.
  /// When true, client may call `/payments/:id/mock-confirm` after checkout.
  static const allowMockPayments = bool.fromEnvironment(
    'ALLOW_MOCK_PAYMENTS',
    defaultValue: true,
  );

  /// When true, Google/Apple buttons can use API demo social login if native
  /// OAuth is not configured yet. Disable for store builds.
  static const allowDemoSocial = bool.fromEnvironment(
    'ALLOW_DEMO_SOCIAL',
    defaultValue: true,
  );

  /// Optional Google OAuth web client ID (serverClientId) for ID tokens.
  static const googleServerClientId = String.fromEnvironment(
    'GOOGLE_SERVER_CLIENT_ID',
    defaultValue: '',
  );
}
