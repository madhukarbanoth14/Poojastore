class AuthUser {
  const AuthUser({
    required this.id,
    required this.phoneE164,
    required this.role,
    required this.status,
    this.fullName,
    this.email,
    this.preferredLanguage = 'en',
    this.timezone,
    this.isNewUser = false,
  });

  final String id;
  final String phoneE164;
  final String role;
  final String status;
  final String? fullName;
  final String? email;
  final String preferredLanguage;
  final String? timezone;
  final bool isNewUser;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      phoneE164: json['phoneE164'] as String,
      role: json['role'] as String,
      status: json['status'] as String,
      fullName: json['fullName'] as String?,
      email: json['email'] as String?,
      preferredLanguage: (json['preferredLanguage'] as String?) ?? 'en',
      timezone: json['timezone'] as String?,
      isNewUser: (json['isNewUser'] as bool?) ?? false,
    );
  }

  bool get isAdmin => role == 'ADMIN';
  bool get isPoojari => role == 'POOJARI';
}
