import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/i18n/language_switcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_controller.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../auth/presentation/auth_controller.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final dark = ref.watch(themeControllerProvider) == ThemeMode.dark;
    final t = context.ps;

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: t.bg,
        appBar: const PsHeader(title: 'Account', showBack: false),
        body: Padding(
          padding: const EdgeInsets.fromLTRB(24, 40, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Explore freely',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 22,
                  color: t.text,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Browse festivals and Pooja Samagri without signing in. Sign in when you are ready to checkout.',
                style: TextStyle(fontSize: 14, color: t.textMuted, height: 1.45),
              ),
              const SizedBox(height: 28),
              FilledButton(
                onPressed: () => context.push('/login'),
                child: const Text('Sign in / Register'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.go('/shop'),
                child: const Text('Browse Pooja Samagri'),
              ),
              const SizedBox(height: 24),
              const LanguageSwitcher(),
            ],
          ),
        ),
      );
    }

    final name = user?.fullName?.trim().isNotEmpty == true
        ? user!.fullName!
        : 'Devotee';
    final phone = user?.phoneE164 ?? '';

    return Scaffold(
      backgroundColor: t.bg,
      appBar: PsHeader(
        title: 'Profile',
        showBack: context.canPop(),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: t.maroon,
                  child: Text(
                    initialsFrom(name),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 20,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 17,
                          color: t.text,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        phone,
                        style: TextStyle(fontSize: 12.5, color: t.textMuted),
                      ),
                      if (user?.email != null && user!.email!.isNotEmpty)
                        Text(
                          user.email!,
                          style: TextStyle(fontSize: 12.5, color: t.textMuted),
                        ),
                    ],
                  ),
                ),
                Material(
                  color: t.surface,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                    side: BorderSide(color: t.border),
                  ),
                  child: InkWell(
                    onTap: () => context.push('/profile/personal'),
                    borderRadius: BorderRadius.circular(11),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      child: Text(
                        'Edit',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: t.text,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            _row(context, 'Personal Details', () => context.push('/profile/personal')),
            _row(context, 'Saved Addresses', () => context.push('/profile/addresses')),
            _row(context, 'Family Members', () => context.push('/profile/family')),
            _row(context, 'Order History', () => context.push('/orders')),
            if (user?.isPoojari == true)
              _row(context, 'Pujari Desk', () => context.go('/poojari')),
            if (user?.isPoojari != true)
              _row(context, 'Join as a pujari', () => context.push('/poojari/apply')),
            if (user?.isAdmin == true)
              _row(context, 'Admin', () => context.push('/admin')),
            _row(context, 'Priest Booking History', () => context.push('/bookings')),
            _row(context, 'Notifications', () => context.push('/notifications')),
            _row(context, 'Wishlist', () => context.push('/wishlist')),
            _row(context, 'Support', () => context.push('/support')),
            const SizedBox(height: 4),
            PsCard(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Language',
                    style: TextStyle(
                      fontWeight: FontWeight.w500,
                      fontSize: 13.5,
                      color: t.text,
                    ),
                  ),
                  const SizedBox(height: 10),
                  const LanguageSwitcher(),
                ],
              ),
            ),
            const SizedBox(height: 10),
            PsCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Dark Mode',
                      style: TextStyle(
                        fontWeight: FontWeight.w500,
                        fontSize: 13.5,
                        color: t.text,
                      ),
                    ),
                  ),
                  PsDarkSwitch(
                    value: dark,
                    onTap: () =>
                        ref.read(themeControllerProvider.notifier).toggle(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            OutlinedButton(
              onPressed: () async {
                await ref.read(authControllerProvider.notifier).logout();
                if (context.mounted) context.go('/login');
              },
              child: const Text(
                'Log Out',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
              ),
            ),
          ],
        ),
    );
  }

  Widget _row(BuildContext context, String label, VoidCallback onTap) {
    final t = context.ps;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: PsCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        onTap: onTap,
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                  fontSize: 13.5,
                  color: t.text,
                ),
              ),
            ),
            Icon(Icons.chevron_right, color: t.textMuted, size: 18),
          ],
        ),
      ),
    );
  }
}
