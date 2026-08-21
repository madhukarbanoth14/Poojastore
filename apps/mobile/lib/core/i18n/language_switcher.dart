import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../../l10n/l10n.dart';
import 'locale_controller.dart';

class LanguageSwitcher extends ConsumerWidget {
  const LanguageSwitcher({
    super.key,
    this.compact = false,
    this.iconColor,
  });

  final bool compact;
  final Color? iconColor;

  Future<void> _set(WidgetRef ref, String code) async {
    await ref.read(localeControllerProvider.notifier).setLanguage(code);
    await ref
        .read(authControllerProvider.notifier)
        .updatePreferredLanguage(code);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeControllerProvider);
    final l10n = context.l10n;

    if (compact) {
      return PopupMenuButton<String>(
        tooltip: l10n.languageTelugu,
        icon: Icon(Icons.translate, color: iconColor),
        initialValue: locale.languageCode,
        onSelected: (code) => _set(ref, code),
        itemBuilder: (_) => [
          PopupMenuItem(value: 'en', child: Text(l10n.languageEnglish)),
          PopupMenuItem(value: 'te', child: Text(l10n.languageTelugu)),
        ],
      );
    }

    return SegmentedButton<String>(
      segments: [
        ButtonSegment(value: 'en', label: Text(l10n.languageEnglish)),
        ButtonSegment(value: 'te', label: Text(l10n.languageTelugu)),
      ],
      selected: {locale.languageCode},
      onSelectionChanged: (set) => _set(ref, set.first),
    );
  }
}
