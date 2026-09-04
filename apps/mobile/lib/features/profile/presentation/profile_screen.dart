import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../l10n/l10n.dart';
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
    final l10n = context.l10n;

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: t.bg,
        appBar: PsHeader(title: l10n.navAccount, showBack: false),
        body: Padding(
          padding: const EdgeInsets.fromLTRB(24, 40, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                l10n.profileGuestTitle,
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 22,
                  color: t.text,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                l10n.profileGuestSubtitle,
                style: TextStyle(fontSize: 14, color: t.textMuted, height: 1.45),
              ),
              const SizedBox(height: 28),
              FilledButton(
                onPressed: () => context.push('/login'),
                child: Text(l10n.signInRegister),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.go('/shop'),
                child: Text(l10n.browseSamagri),
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
        : l10n.devotee;
    final phone = user?.phoneE164 ?? '';

    return Scaffold(
      backgroundColor: t.bg,
      appBar: PsHeader(
        title: l10n.profileTitle,
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
                        l10n.edit,
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
            _row(context, l10n.personalDetails, () => context.push('/profile/personal')),
            _row(context, l10n.savedAddresses, () => context.push('/profile/addresses')),
            _row(context, l10n.familyMembers, () => context.push('/profile/family')),
            _row(context, l10n.orderHistory, () => context.push('/orders')),
            if (user?.isPoojari == true)
              _row(context, l10n.pujariDesk, () => context.go('/poojari')),
            if (user?.isPoojari != true)
              _row(context, l10n.joinAsPujari, () => context.push('/poojari/apply')),
            if (user?.isAdmin == true)
              _row(context, l10n.admin, () => context.push('/admin')),
            _row(context, l10n.priestBookingHistory, () => context.push('/bookings')),
            _row(context, l10n.notifications, () => context.push('/notifications')),
            _row(context, l10n.wishlist, () => context.push('/wishlist')),
            _row(context, l10n.support, () => context.push('/support')),
            const SizedBox(height: 4),
            PsCard(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.language,
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
                      l10n.darkMode,
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
              child: Text(
                l10n.logOut,
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
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
