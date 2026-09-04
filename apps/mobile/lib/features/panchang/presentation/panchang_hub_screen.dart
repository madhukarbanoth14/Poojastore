import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/catalog/panchang_terms_l10n.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../l10n/l10n.dart';
import '../data/panchang_api.dart';
import 'panchang_almanac_card.dart';

class PanchangHubScreen extends ConsumerStatefulWidget {
  const PanchangHubScreen({super.key});

  @override
  ConsumerState<PanchangHubScreen> createState() => _PanchangHubScreenState();
}

class _PanchangHubScreenState extends ConsumerState<PanchangHubScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  Map<String, dynamic>? _today;
  Map<String, dynamic>? _guidance;
  Map<String, dynamic>? _calendar;
  String? _error;
  bool _loading = true;
  late DateTime _selectedDay;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedDay = DateTime(now.year, now.month, now.day);
    _tabs = TabController(length: 3, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final api = ref.read(panchangApiProvider);
    final now = DateTime.now();
    try {
      final today = await api.forDate(isoDate(_selectedDay));
      Map<String, dynamic>? guidance;
      try {
        guidance = await api.guidanceToday();
      } catch (_) {
        guidance = null;
      }
      final calendar = await api.calendar(
        year: now.year,
        month: now.month,
        city: today['cityName'] as String?,
      );
      setState(() {
        _today = today;
        _guidance = guidance;
        _calendar = calendar;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = '$e';
        _loading = false;
      });
    }
  }

  Future<void> _pickDate() async {
    final picked = await pickPanchangDate(context, selected: _selectedDay);
    if (picked == null || !mounted) return;
    setState(() => _selectedDay = DateTime(picked.year, picked.month, picked.day));
    await _load(    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: Text(l10n.panchangTitle),
        actions: [
          IconButton(
            tooltip: almanacLabel('pickDate', context.isTelugu),
            onPressed: _loading ? null : _pickDate,
            icon: const Icon(Icons.calendar_month, color: AppColors.maroonDeep),
          ),
          IconButton(
            tooltip: l10n.refresh,
            onPressed: _load,
            icon: const Icon(Icons.refresh, color: AppColors.maroonDeep),
          ),
        ],
        bottom: TabBar(
          controller: _tabs,
          tabs: [
            Tab(text: l10n.tabToday),
            Tab(text: l10n.tabGuidance),
            Tab(text: l10n.tabCalendar),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : TabBarView(
                  controller: _tabs,
                  children: [
                    _TodayTab(
                      today: _today!,
                      selected: _selectedDay,
                      onPickDate: _pickDate,
                    ),
                    _GuidanceTab(guidance: _guidance),
                    _CalendarTab(calendar: _calendar!),
                  ],
                ),
    );
  }
}

class _TodayTab extends StatelessWidget {
  const _TodayTab({
    required this.today,
    required this.selected,
    required this.onPickDate,
  });

  final Map<String, dynamic> today;
  final DateTime selected;
  final VoidCallback onPickDate;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final te = context.isTelugu;
    final festivals = (today['festivals'] as List?) ?? [];
    final now = DateTime.now();
    final isToday = selected.year == now.year &&
        selected.month == now.month &&
        selected.day == now.day;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        OutlinedButton.icon(
          onPressed: onPickDate,
          icon: const Icon(Icons.calendar_month, color: AppColors.maroon),
          label: Text(
            isToday
                ? almanacLabel('pickDate', te)
                : isoDate(selected),
            style: const TextStyle(
              color: AppColors.maroon,
              fontWeight: FontWeight.w700,
            ),
          ),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: Color(0xFFC9A227)),
            backgroundColor: Colors.white,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          today['cityName'] as String? ?? 'Hyderabad',
          style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
        const SizedBox(height: 14),
        PanchangAlmanacCard(data: today),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(14, 13, 14, 13),
          decoration: BoxDecoration(
            color: const Color(0xFFFEF6E4),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFD9AE55)),
          ),
          child: Text(
            l10n.panchangDisclaimer,
            style: const TextStyle(
              fontSize: 12,
              height: 1.55,
              color: Color(0xFF7A5A2C),
            ),
          ),
        ),
        if (today['specialNote'] != null) ...[
          const SizedBox(height: 12),
          Text(
            l10n.panchangNote('${today['specialNote']}'),
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
        if (festivals.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text(l10n.festivals,
              style: const TextStyle(fontWeight: FontWeight.w700)),
          ...festivals.map(
            (f) => ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text((f as Map)['title'] as String? ?? ''),
              subtitle: Text(f['description'] as String? ?? ''),
            ),
          ),
        ],
      ],
    );
  }
}

class _GuidanceTab extends StatelessWidget {
  const _GuidanceTab({required this.guidance});

  final Map<String, dynamic>? guidance;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final te = context.isTelugu;

    if (guidance == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                l10n.guidanceEmptyPrompt,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => context.push('/panchang/profile'),
                style:
                    FilledButton.styleFrom(backgroundColor: AppColors.maroon),
                child: Text(l10n.setBirthProfile),
              ),
            ],
          ),
        ),
      );
    }

    final g = guidance!['guidance'] as Map<String, dynamic>;
    final rasiLabel =
        localizeRasiDisplayLabel(guidance!['rasiLabel'] as String?, te);
    return ListView(
      padding: const EdgeInsets.fromLTRB(0, 18, 0, 20),
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            rasiLabel,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 19,
              color: AppColors.text,
            ),
          ),
        ),
        const SizedBox(height: 6),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            g['summary'] as String? ?? '',
            style: const TextStyle(
              fontSize: 13.5,
              height: 1.5,
              color: AppColors.textMuted,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            decoration: BoxDecoration(
              color: AppColors.blush,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 2.4,
              crossAxisSpacing: 16,
              mainAxisSpacing: 12,
              children: [
                _gstat(l10n.guidanceRecommendedPuja, g['recommendedPuja']),
                _gstat(l10n.guidanceLuckyColor, g['luckyColor']),
                _gstat(l10n.guidanceDirection, g['luckyDirection']),
                _gstat(l10n.guidanceNumber, '${g['luckyNumber']}'),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _section(l10n.guidanceCareer, g['career']),
              _section(l10n.guidanceFinance, g['finance']),
              _section(l10n.guidanceHealth, g['health']),
              _section(l10n.guidanceTravel, g['travel']),
            ],
          ),
        ),
      ],
    );
  }

  Widget _gstat(String label, Object? value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style:
                const TextStyle(fontSize: 11.5, color: AppColors.textMuted)),
        const SizedBox(height: 2),
        Text(
          '$value',
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w700,
            color: AppColors.text,
          ),
        ),
      ],
    );
  }

  Widget _section(String title, Object? body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13.5,
                  color: AppColors.maroonDeep)),
          const SizedBox(height: 3),
          Text('$body',
              style: const TextStyle(
                  fontSize: 13, height: 1.5, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}

class _CalendarTab extends StatelessWidget {
  const _CalendarTab({required this.calendar});

  final Map<String, dynamic> calendar;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final te = context.isTelugu;
    final days = (calendar['days'] as List).cast<Map<String, dynamic>>();
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      itemCount: days.length,
      itemBuilder: (context, index) {
        final day = days[index];
        final iso = day['date'] as String? ?? '';
        final weekday = localizeWeekday(day['weekday'] as String?, te);
        final dateLabel =
            (day['dateLabel'] as String?)?.trim().isNotEmpty == true
                ? localizeDateLabel(day['dateLabel'] as String, te)
                : localizeDateLabel(formatIsoDateLabel(iso), te);
        final isToday = iso == localIsoDate();
        final tithiLine = localizeTithiNakshatraLine(
          day['tithi'] as String?,
          day['nakshatra'] as String?,
          te,
        );
        return Container(
          padding: const EdgeInsets.fromLTRB(12, 13, 4, 13),
          decoration: BoxDecoration(
            border: Border(
              bottom: const BorderSide(color: AppColors.divider),
              left: BorderSide(
                color: isToday ? AppColors.gold : Colors.transparent,
                width: 3,
              ),
            ),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$weekday · $dateLabel',
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.text,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      tithiLine,
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              if (isToday)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.saffron,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    l10n.todayBadge,
                    style: const TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
