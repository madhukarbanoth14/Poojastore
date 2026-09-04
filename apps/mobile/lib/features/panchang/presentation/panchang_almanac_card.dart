import 'package:flutter/material.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/catalog/panchang_terms_l10n.dart';
import '../../../core/theme/app_theme.dart';

class PanchangAlmanacCard extends StatelessWidget {
  const PanchangAlmanacCard({super.key, required this.data});

  final Map<String, dynamic> data;

  @override
  Widget build(BuildContext context) {
    final te = context.isTelugu;
    final tithi = tithiShortName(data['tithi'] as String?, te);
    final tithiUntil = untilPhrase(data['tithiEndsAt'] as String?, te);
    final nak = localizeAlmanacTerm(data['nakshatra'] as String?, te);
    final nakUntil = untilPhrase(data['nakshatraEndsAt'] as String?, te);
    final yoga = localizeAlmanacTerm(data['yoga'] as String?, te);
    final yogaUntil = untilPhrase(data['yogaEndsAt'] as String?, te);

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8E8),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFC9A227)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Container(
            width: double.infinity,
            color: AppColors.maroon,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Text(
              weekdayDateBanner(data, te),
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFFFFF8E8),
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
          ),
          if (data['samvatsaram'] != null)
            Container(
              width: double.infinity,
              color: const Color(0xFFE7C75A),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Text(
                samvatsaramLine(data['samvatsaram'] as String?, te),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF2E0A12),
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ),
          if (data['ayana'] != null || data['rithu'] != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
              child: Text(
                ayanaRithuLine(
                  data['ayana'] as String?,
                  data['rithu'] as String?,
                  te,
                ),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF1D4ED8),
                  fontWeight: FontWeight.w700,
                  fontSize: 13.5,
                ),
              ),
            ),
          Container(
            margin: const EdgeInsets.fromLTRB(16, 4, 16, 10),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: const Color(0xFFC9A227)),
            ),
            child: Text(
              masamPakshaLine(
                data['masam'] as String?,
                data['paksha'] as String?,
                te,
              ),
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF15803D),
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: Column(
              children: [
                _row(te, Icons.nightlight_round, 'tithi',
                    tithiUntil.isEmpty ? tithi : '$tithi $tithiUntil'),
                _row(te, Icons.calendar_today, 'varam',
                    localizeWeekday(data['weekday'] as String?, te)),
                _row(te, Icons.star, 'nakshatra',
                    nakUntil.isEmpty ? nak : '$nak $nakUntil'),
                _row(te, Icons.wb_sunny, 'yoga',
                    yogaUntil.isEmpty ? yoga : '$yoga $yogaUntil'),
                _row(te, Icons.spa, 'karana', karanaValue(data, te)),
                _row(te, Icons.block, 'varjyam', windowPhrase(data['varjyam'], te)),
                _row(te, Icons.warning_amber, 'durmuhurtham',
                    windowPhrase(data['durmuhurtham'], te)),
                _row(te, Icons.water_drop, 'amrit',
                    windowPhrase(data['amritKalam'], te)),
                _row(te, Icons.schedule, 'rahu',
                    windowPhrase(data['rahuKalam'], te)),
                _row(te, Icons.timelapse, 'yama',
                    windowPhrase(data['yamagandam'], te)),
                _row(te, Icons.wb_sunny_outlined, 'suryaRashi',
                    localizeAlmanacTerm(data['suryaRashi'] as String?, te)),
                _row(te, Icons.nightlight, 'chandraRashi',
                    localizeAlmanacTerm(data['chandraRashi'] as String?, te)),
                _row(te, Icons.wb_twilight, 'sunrise',
                    formatAlmanacTime(data['sunrise'] as String?, te)),
                _row(te, Icons.wb_twilight_outlined, 'sunset',
                    formatAlmanacTime(data['sunset'] as String?, te),
                    last: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(bool te, IconData icon, String key, String value, {bool last = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 7),
      decoration: BoxDecoration(
        border: last
            ? null
            : const Border(bottom: BorderSide(color: Color(0xFFEFDAB8))),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: const Color(0xFFB42318)),
          const SizedBox(width: 8),
          SizedBox(
            width: 92,
            child: Text(
              almanacLabel(key, te),
              style: const TextStyle(
                color: Color(0xFFB42318),
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Color(0xFF1F140F),
                fontWeight: FontWeight.w600,
                fontSize: 13.5,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

Future<DateTime?> pickPanchangDate(
  BuildContext context, {
  required DateTime selected,
}) {
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  return showDatePicker(
    context: context,
    initialDate: selected.isBefore(today) ? today : selected,
    firstDate: today,
    lastDate: today.add(const Duration(days: 90)),
    helpText: almanacLabel(
      'pickDate',
      Localizations.localeOf(context).languageCode == 'te',
    ),
  );
}
