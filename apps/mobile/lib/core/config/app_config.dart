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
}
