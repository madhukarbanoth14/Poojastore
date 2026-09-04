import 'package:flutter/widgets.dart';
import '../../l10n/generated/app_localizations.dart';
import '../widgets/ps_format.dart';
import 'panchang_terms_l10n.dart';

/// Whether the active app locale is Telugu.
bool isTeluguLocale(BuildContext context) =>
    Localizations.localeOf(context).languageCode == 'te';

extension CatalogLocaleX on BuildContext {
  bool get isTelugu => isTeluguLocale(this);
}

/// Localized "days until festival" badge text.
String festivalDaysToLabel({
  required DateTime target,
  required AppLocalizations l10n,
}) {
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  final targetDay = DateTime(target.year, target.month, target.day);
  final days = targetDay.difference(today).inDays;
  if (days <= 0) return l10n.festivalToday;
  if (days == 1) return l10n.festivalInOneDay;
  return l10n.festivalInDays(days);
}

/// Localized panchang headline (weekday · date), never tithi.
String localizedPanchangHeadline(Map<String, dynamic>? today, bool te) {
  if (!te) return panchangHeadline(today);
  final weekday = localizeWeekday(today?['weekday'] as String?, te);
  final label = (today?['dateLabel'] as String?)?.trim();
  final fromIso = formatIsoDateLabel(today?['date'] as String?);
  final datePart = (label != null && label.isNotEmpty)
      ? localizeDateLabel(label, te)
      : _localizeIsoDateLabel(fromIso, te);
  if (weekday.isNotEmpty && datePart.isNotEmpty) {
    return '$weekday · $datePart';
  }
  if (datePart.isNotEmpty) return datePart;
  return panchangHeadline(today);
}

String _localizeIsoDateLabel(String label, bool te) {
  if (label.isEmpty || !te) return label;
  return localizeDateLabel(label, te);
}
