import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../l10n/l10n.dart';
import '../data/panchang_api.dart';

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

  @override
  void initState() {
    super.initState();
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
      final today = await api.today();
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

  String _window(dynamic value) {
    if (value is Map) {
      return '${value['start']} – ${value['end']}';
    }
    return '—';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: const Text('Panchang & Zodiac'),
        actions: [
          IconButton(
            tooltip: l10n.refresh,
            onPressed: _load,
            icon: const Icon(Icons.refresh, color: AppColors.maroonDeep),
          ),
        ],
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Today'),
            Tab(text: 'Guidance'),
            Tab(text: 'Calendar'),
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
                    _TodayTab(today: _today!, window: _window),
                    _GuidanceTab(guidance: _guidance),
                    _CalendarTab(calendar: _calendar!),
                  ],
                ),
    );
  }
}

class _TodayTab extends StatelessWidget {
  const _TodayTab({required this.today, required this.window});

  final Map<String, dynamic> today;
  final String Function(dynamic) window;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final festivals = (today['festivals'] as List?) ?? [];
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          panchangHeadline(today),
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 17,
            color: AppColors.text,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          today['cityName'] as String? ?? 'Hyderabad',
          style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(14, 13, 14, 13),
          decoration: BoxDecoration(
            color: const Color(0xFFFEF6E4),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFD9AE55)),
          ),
          child: const Text(
            'Panchang times are approximate civil calculations for general guidance. Consult your family priest for ritual muhurat timing.',
            style: TextStyle(
              fontSize: 12,
              height: 1.55,
              color: Color(0xFF7A5A2C),
            ),
          ),
        ),
        const SizedBox(height: 18),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.blush,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              _stat('Tithi', today['tithi']),
              _stat('Nakshatra', today['nakshatra']),
              _stat('Yoga', today['yoga']),
              _stat('Karana', today['karana']),
              _stat('Sunrise', today['sunrise']),
              _stat('Sunset', today['sunset']),
              _stat('Moonrise', today['moonrise'] ?? '—'),
              _stat('Moonset', today['moonset'] ?? '—'),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'Muhurats',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 14.5,
            color: AppColors.text,
          ),
        ),
        const SizedBox(height: 10),
        _muhurat('Rahu Kalam', window(today['rahuKalam']), inauspicious: true),
        _muhurat('Yamagandam', window(today['yamagandam']), inauspicious: true),
        _muhurat('Gulika', window(today['gulikaKalam']), inauspicious: true),
        _muhurat('Abhijit Muhurat', window(today['abhijitMuhurtham'])),
        _muhurat('Amrit Kalam', window(today['amritKalam'])),
        if (today['specialNote'] != null) ...[
          const SizedBox(height: 12),
          Text(
            'Note: ${today['specialNote']}',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
        if (festivals.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text(l10n.festivals, style: const TextStyle(fontWeight: FontWeight.w700)),
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

  Widget _stat(String label, Object? value) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
          Flexible(
            child: Text(
              '$value',
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: AppColors.text,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _muhurat(String name, String time, {bool inauspicious = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: inauspicious ? AppColors.saffron : AppColors.gold,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              name,
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: AppColors.text,
              ),
            ),
          ),
          Text(
            time,
            style: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}

class _GuidanceTab extends StatelessWidget {
  const _GuidanceTab({required this.guidance});

  final Map<String, dynamic>? guidance;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    if (guidance == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Save your birth profile (rasi + city) to unlock personalized daily guidance.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => context.push('/panchang/profile'),
                style: FilledButton.styleFrom(backgroundColor: AppColors.maroon),
                child: Text(l10n.setBirthProfile),
              ),
            ],
          ),
        ),
      );
    }

    final g = guidance!['guidance'] as Map<String, dynamic>;
    return ListView(
      padding: const EdgeInsets.fromLTRB(0, 18, 0, 20),
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            guidance!['rasiLabel'] as String? ?? '',
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
                _gstat('Recommended puja', g['recommendedPuja']),
                _gstat('Lucky color', g['luckyColor']),
                _gstat('Direction', g['luckyDirection']),
                _gstat('Number', '${g['luckyNumber']}'),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _section('Career', g['career']),
              _section('Finance', g['finance']),
              _section('Health', g['health']),
              _section('Travel', g['travel']),
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
        Text(label, style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted)),
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
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5, color: AppColors.maroonDeep)),
          const SizedBox(height: 3),
          Text('$body', style: const TextStyle(fontSize: 13, height: 1.5, color: AppColors.textMuted)),
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
    final days = (calendar['days'] as List).cast<Map<String, dynamic>>();
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      itemCount: days.length,
      itemBuilder: (context, index) {
        final day = days[index];
        final iso = day['date'] as String? ?? '';
        final weekday = day['weekday'] as String? ?? '';
        final dateLabel =
            (day['dateLabel'] as String?)?.trim().isNotEmpty == true
            ? day['dateLabel'] as String
            : formatIsoDateLabel(iso);
        final isToday = iso == localIsoDate();
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
                      '${day['tithi']} · ${day['nakshatra']}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              if (isToday)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.saffron,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'TODAY',
                    style: TextStyle(
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
