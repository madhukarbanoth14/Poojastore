String formatInr(num minor) => '₹${(minor / 100).round()}';

String starString(num rating) {
  final full = rating.round().clamp(0, 5);
  return '${'★' * full}${'☆' * (5 - full)}';
}

String initialsFrom(String name) {
  final cleaned = name.replaceFirst(RegExp(r'^Pandit\s+', caseSensitive: false), '');
  final parts = cleaned.trim().split(RegExp(r'\s+'));
  if (parts.isEmpty) return 'P';
  if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
  return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
}

const _weekdayNames = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const _monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

String formatIsoDateLabel(String? iso) {
  if (iso == null || iso.length < 10) return '';
  final parts = iso.substring(0, 10).split('-');
  if (parts.length != 3) return '';
  final month = int.tryParse(parts[1]);
  final day = int.tryParse(parts[2]);
  if (month == null || day == null || month < 1 || month > 12) return '';
  return '$day ${_monthNames[month - 1]} ${parts[0]}';
}

String localIsoDate([DateTime? now]) {
  final date = now ?? DateTime.now();
  final month = date.month.toString().padLeft(2, '0');
  final day = date.day.toString().padLeft(2, '0');
  return '${date.year}-$month-$day';
}

String localCivilDateLine([DateTime? now]) {
  final date = now ?? DateTime.now();
  return '${_weekdayNames[date.weekday - 1]} · ${date.day} ${_monthNames[date.month - 1]} ${date.year}';
}

/// Gold date line for Today's Panchang: weekday + calendar date, never tithi.
String panchangHeadline(Map<String, dynamic>? today) {
  final weekday = (today?['weekday'] as String?)?.trim();
  final label = (today?['dateLabel'] as String?)?.trim();
  final fromIso = formatIsoDateLabel(today?['date'] as String?);
  final datePart = (label != null && label.isNotEmpty) ? label : fromIso;
  if (weekday != null && weekday.isNotEmpty && datePart.isNotEmpty) {
    return '$weekday · $datePart';
  }
  if (datePart.isNotEmpty) return datePart;

  final summary = (today?['summary'] as String?)?.trim();
  if (summary != null &&
      summary.isNotEmpty &&
      !_looksLikeTithiSummary(summary)) {
    return summary;
  }
  return localCivilDateLine();
}

bool _looksLikeTithiSummary(String value) {
  final lower = value.toLowerCase();
  return lower.contains('nakshatra') ||
      lower.contains('shukla') ||
      lower.contains('krishna');
}

