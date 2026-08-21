import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'core/network/fallback_dns.dart';

void main() {
  HttpOverrides.global = FallbackDnsHttpOverrides();
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: PoojaStoreApp()));
}
