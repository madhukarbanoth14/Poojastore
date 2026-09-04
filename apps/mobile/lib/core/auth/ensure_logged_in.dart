import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../theme/app_theme.dart';

/// Returns true if the user is authenticated. Otherwise opens `/login` and
/// waits for the user to finish (or dismiss). Used to gate cart / checkout
/// while allowing browse.
Future<bool> ensureLoggedIn(
  BuildContext context,
  WidgetRef ref, {
  String message = 'Please sign in to continue',
}) async {
  if (ref.read(authControllerProvider).isAuthenticated) return true;
  if (!context.mounted) return false;

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      backgroundColor: AppColors.maroonDeep,
      duration: const Duration(seconds: 2),
    ),
  );

  // Return here after OTP so router can send the user back (avoids pop races).
  final returnTo = GoRouterState.of(context).matchedLocation;
  await context.push<void>(
    '/login?next=${Uri.encodeComponent(returnTo)}',
  );
  if (!context.mounted) return false;
  return ref.read(authControllerProvider).isAuthenticated;
}
