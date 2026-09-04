import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Shared secure storage — Android uses EncryptedSharedPreferences for reliability.
const secureStorage = FlutterSecureStorage(
  aOptions: AndroidOptions(encryptedSharedPreferences: true),
);
