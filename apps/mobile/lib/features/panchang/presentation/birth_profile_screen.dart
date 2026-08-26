import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/ensure_logged_in.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/panchang_api.dart';
import '../data/rasi_chart_service.dart';

const _rasiOptions = [
  'MESHA',
  'VRISHABHA',
  'MITHUNA',
  'KARKA',
  'SIMHA',
  'KANYA',
  'TULA',
  'VRISHCHIKA',
  'DHANU',
  'MAKARA',
  'KUMBHA',
  'MEENA',
];

const _rasiLabels = {
  'MESHA': 'Mesha (Aries)',
  'VRISHABHA': 'Vrishabha (Taurus)',
  'MITHUNA': 'Mithuna (Gemini)',
  'KARKA': 'Karka (Cancer)',
  'SIMHA': 'Simha (Leo)',
  'KANYA': 'Kanya (Virgo)',
  'TULA': 'Tula (Libra)',
  'VRISHCHIKA': 'Vrishchika (Scorpio)',
  'DHANU': 'Dhanu (Sagittarius)',
  'MAKARA': 'Makara (Capricorn)',
  'KUMBHA': 'Kumbha (Aquarius)',
  'MEENA': 'Meena (Pisces)',
};

class BirthProfileScreen extends ConsumerStatefulWidget {
  const BirthProfileScreen({super.key});

  @override
  ConsumerState<BirthProfileScreen> createState() => _BirthProfileScreenState();
}

class _BirthProfileScreenState extends ConsumerState<BirthProfileScreen> {
  final _name = TextEditingController();
  final _dob = TextEditingController(text: '1990-01-15');
  final _birthTime = TextEditingController(text: '06:00');
  final _birthPlace = TextEditingController();
  final _nakshatra = TextEditingController();
  final _gotram = TextEditingController();
  final _chart = RasiChartService();

  String _rasi = 'MESHA';
  String _city = 'Hyderabad';
  List<Map<String, dynamic>> _cities = const [];
  bool _loading = true;
  bool _saving = false;
  bool _computing = false;
  String? _error;
  String? _chartHint;
  Map<String, dynamic>? _guidance;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  @override
  void dispose() {
    _name.dispose();
    _dob.dispose();
    _birthTime.dispose();
    _birthPlace.dispose();
    _nakshatra.dispose();
    _gotram.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    final loggedIn = await ensureLoggedIn(
      context,
      ref,
      message: 'Sign in to save your birth profile',
    );
    if (!loggedIn || !mounted) {
      if (mounted) context.pop();
      return;
    }

    final user = ref.read(authControllerProvider).user;
    _name.text = user?.fullName?.trim() ?? '';

    final api = ref.read(panchangApiProvider);
    try {
      final cities = await api.cities();
      final profile = await api.getBirthProfile();
      if (!mounted) return;
      setState(() {
        _cities = cities;
        if (_cities.isNotEmpty &&
            !_cities.any((c) => c['name'] == _city)) {
          _city = _cities.first['name'] as String;
        }
        if (profile != null) {
          final dob = profile['dateOfBirth'] as String? ?? '';
          _dob.text = dob.length >= 10 ? dob.substring(0, 10) : dob;
          _birthTime.text = _normalizeTime(profile['birthTime'] as String?) ??
              _birthTime.text;
          _birthPlace.text = (profile['birthPlace'] as String?) ?? '';
          _nakshatra.text = (profile['nakshatra'] as String?) ?? '';
          _gotram.text = (profile['gotram'] as String?) ?? '';
          _rasi = profile['rasi'] as String? ?? _rasi;
          _city = profile['cityName'] as String? ?? _city;
        }
        _loading = false;
      });
      await _loadGuidance();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = friendlyNetworkError(e);
        _loading = false;
      });
    }
  }

  Future<void> _loadGuidance() async {
    try {
      final g = await ref.read(panchangApiProvider).guidanceToday();
      if (mounted) setState(() => _guidance = g);
    } catch (_) {
      if (mounted) setState(() => _guidance = null);
    }
  }

  String? _normalizeTime(String? raw) {
    if (raw == null) return null;
    final t = raw.trim();
    if (t.isEmpty) return null;
    final m = RegExp(r'^(\d{1,2}):(\d{2})(?::\d{2})?$').firstMatch(t);
    if (m == null) return null;
    final h = int.parse(m.group(1)!);
    final min = int.parse(m.group(2)!);
    if (h > 23 || min > 59) return null;
    return '${h.toString().padLeft(2, '0')}:${min.toString().padLeft(2, '0')}';
  }

  Map<String, dynamic>? _cityByName(String name) {
    for (final c in _cities) {
      if ((c['name'] as String).toLowerCase() == name.toLowerCase()) {
        return c;
      }
    }
    return null;
  }

  Future<void> _pickDob() async {
    final now = DateTime.now();
    final initial = DateTime.tryParse(_dob.text) ?? DateTime(1990, 1, 15);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1920),
      lastDate: now,
    );
    if (picked != null) {
      setState(() {
        _dob.text =
            '${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
      });
    }
  }

  Future<void> _pickTime() async {
    final normalized = _normalizeTime(_birthTime.text) ?? '06:00';
    final parts = normalized.split(':');
    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(
        hour: int.parse(parts[0]),
        minute: int.parse(parts[1]),
      ),
    );
    if (picked != null) {
      setState(() {
        _birthTime.text =
            '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
      });
    }
  }

  Future<void> _computeRasi() async {
    setState(() {
      _computing = true;
      _error = null;
      _chartHint = null;
    });
    try {
      final dob = DateTime.tryParse(_dob.text.trim());
      if (dob == null) {
        throw StateError('Enter date of birth as YYYY-MM-DD');
      }
      final time = _normalizeTime(_birthTime.text);
      if (time == null) {
        throw StateError('Enter birth time as HH:MM');
      }
      final parts = time.split(':');
      final placeName = _birthPlace.text.trim().isNotEmpty
          ? _birthPlace.text.trim()
          : _city;
      final city = _cityByName(placeName) ?? _cityByName(_city) ?? (_cities.isNotEmpty ? _cities.first : null);
      if (city == null) {
        throw StateError('Select a city for birth place coordinates');
      }
      final result = await _chart.compute(
        dateOfBirth: dob,
        hour: int.parse(parts[0]),
        minute: int.parse(parts[1]),
        latitude: (city['latitude'] as num).toDouble(),
        longitude: (city['longitude'] as num).toDouble(),
        name: _name.text.trim().isEmpty ? null : _name.text.trim(),
      );
      if (!mounted) return;
      setState(() {
        _rasi = result.rasi;
        _nakshatra.text = result.nakshatra;
        if (_birthPlace.text.trim().isEmpty) {
          _birthPlace.text = city['name'] as String;
        }
        _chartHint =
            'Janma rāśi: ${result.rasiLabel} · Lagna: ${result.lagnaLabel}';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = friendlyNetworkError(e));
    } finally {
      if (mounted) setState(() => _computing = false);
    }
  }

  Future<void> _save() async {
    final loggedIn = await ensureLoggedIn(
      context,
      ref,
      message: 'Sign in to save your birth profile',
    );
    if (!loggedIn || !mounted) return;

    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final time = _normalizeTime(_birthTime.text);
      if (DateTime.tryParse(_dob.text.trim()) == null) {
        throw StateError('Enter a valid date of birth (YYYY-MM-DD)');
      }
      if (_birthTime.text.trim().isNotEmpty && time == null) {
        throw StateError('Birth time must be HH:MM (24-hour)');
      }

      final name = _name.text.trim();
      if (name.isNotEmpty) {
        await ref.read(authControllerProvider.notifier).updateProfile(
              fullName: name,
            );
      }

      await ref.read(panchangApiProvider).saveBirthProfile({
        'dateOfBirth': _dob.text.trim(),
        if (time != null) 'birthTime': time,
        if (_birthPlace.text.trim().isNotEmpty)
          'birthPlace': _birthPlace.text.trim(),
        'rasi': _rasi,
        if (_nakshatra.text.trim().isNotEmpty)
          'nakshatra': _nakshatra.text.trim(),
        if (_gotram.text.trim().isNotEmpty) 'gotram': _gotram.text.trim(),
        'cityName': _city,
      });
      await _loadGuidance();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.birthProfileSaved)),
      );
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      final data = e.response?.data;
      String msg = friendlyNetworkError(e);
      if (status == 401) {
        msg = 'Session expired. Please sign in again.';
      } else if (status == 400) {
        msg = 'Check date (YYYY-MM-DD) and time (HH:MM), then try again.';
        if (data is Map && data['message'] != null) {
          msg = '$msg (${data['message']})';
        }
      }
      if (mounted) setState(() => _error = msg);
    } catch (e) {
      if (mounted) setState(() => _error = friendlyNetworkError(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final bottom = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(
        title: l10n.birthProfile,
        showBack: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: EdgeInsets.fromLTRB(20, 16, 20, 24 + bottom),
              children: [
                Text(
                  'Enter name, date, time and place. We compute your janma rāśi (Moon sign) and today’s guidance.',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    height: 1.45,
                    fontSize: 13.5,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _name,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(labelText: 'Full name'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _dob,
                  readOnly: true,
                  onTap: _pickDob,
                  decoration: const InputDecoration(
                    labelText: 'Date of birth',
                    suffixIcon: Icon(Icons.calendar_today_outlined, size: 18),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _birthTime,
                  readOnly: true,
                  onTap: _pickTime,
                  decoration: const InputDecoration(
                    labelText: 'Birth time',
                    suffixIcon: Icon(Icons.schedule_outlined, size: 18),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _birthPlace,
                  decoration: const InputDecoration(
                    labelText: 'Birth place (city)',
                    hintText: 'Hyderabad, Bengaluru, …',
                  ),
                ),
                const SizedBox(height: 12),
                if (_cities.isNotEmpty)
                  DropdownButtonFormField<String>(
                    key: ValueKey('city-$_city'),
                    initialValue: _cities.any((c) => c['name'] == _city)
                        ? _city
                        : _cities.first['name'] as String,
                    decoration: const InputDecoration(
                      labelText: 'City for daily panchang',
                    ),
                    items: _cities
                        .map(
                          (c) => DropdownMenuItem(
                            value: c['name'] as String,
                            child: Text(c['name'] as String),
                          ),
                        )
                        .toList(),
                    onChanged: (v) => setState(() => _city = v ?? _city),
                  ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: _computing ? null : _computeRasi,
                  icon: _computing
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.auto_awesome),
                  label: Text(
                    _computing ? 'Computing rāśi…' : 'Fetch Rasi Palalu',
                  ),
                ),
                if (_chartHint != null) ...[
                  const SizedBox(height: 10),
                  Text(
                    _chartHint!,
                    style: const TextStyle(
                      color: AppColors.maroonDeep,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  key: ValueKey('rasi-$_rasi'),
                  initialValue: _rasiOptions.contains(_rasi) ? _rasi : 'MESHA',
                  decoration: const InputDecoration(labelText: 'Rāśi (Moon sign)'),
                  items: _rasiOptions
                      .map(
                        (r) => DropdownMenuItem(
                          value: r,
                          child: Text(_rasiLabels[r] ?? r),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setState(() => _rasi = v ?? _rasi),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _nakshatra,
                  decoration: const InputDecoration(
                    labelText: 'Nakshatra',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _gotram,
                  decoration: const InputDecoration(
                    labelText: 'Gotram (optional)',
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: Colors.red)),
                ],
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.maroon,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    minimumSize: const Size.fromHeight(48),
                  ),
                  child: Text(_saving ? l10n.saving : l10n.saveProfile),
                ),
                if (_guidance != null) ...[
                  const SizedBox(height: 28),
                  const Text(
                    'Today for your rāśi',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 10),
                  _GuidanceCard(guidance: _guidance!),
                ],
              ],
            ),
    );
  }
}

class _GuidanceCard extends StatelessWidget {
  const _GuidanceCard({required this.guidance});

  final Map<String, dynamic> guidance;

  @override
  Widget build(BuildContext context) {
    final g = guidance['guidance'] as Map<String, dynamic>? ?? guidance;
    final rows = <(String, String)>[
      ('Summary', '${g['summary'] ?? ''}'),
      ('Recommended puja', '${g['recommendedPuja'] ?? ''}'),
      ('Lucky colour', '${g['luckyColor'] ?? ''}'),
      ('Lucky direction', '${g['luckyDirection'] ?? ''}'),
      ('Lucky number', '${g['luckyNumber'] ?? ''}'),
      ('Career', '${g['career'] ?? ''}'),
      ('Finance', '${g['finance'] ?? ''}'),
      ('Health', '${g['health'] ?? ''}'),
      ('Travel', '${g['travel'] ?? ''}'),
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.blush,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            guidance['rasiLabel'] as String? ?? '',
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: AppColors.maroonDeep,
            ),
          ),
          const SizedBox(height: 10),
          ...rows.where((r) => r.$2.trim().isNotEmpty).map(
                (r) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(
                        fontSize: 13,
                        height: 1.4,
                        color: AppColors.text,
                      ),
                      children: [
                        TextSpan(
                          text: '${r.$1}: ',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        TextSpan(text: r.$2),
                      ],
                    ),
                  ),
                ),
              ),
        ],
      ),
    );
  }
}
