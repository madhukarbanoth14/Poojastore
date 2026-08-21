import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../data/panchang_api.dart';

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

class BirthProfileScreen extends ConsumerStatefulWidget {
  const BirthProfileScreen({super.key});

  @override
  ConsumerState<BirthProfileScreen> createState() => _BirthProfileScreenState();
}

class _BirthProfileScreenState extends ConsumerState<BirthProfileScreen> {
  final _dob = TextEditingController(text: '1990-01-15');
  final _birthTime = TextEditingController();
  final _birthPlace = TextEditingController();
  final _nakshatra = TextEditingController();
  final _gotram = TextEditingController();

  String _rasi = 'MESHA';
  String _city = 'Bengaluru';
  List<String> _cities = const ['Bengaluru'];
  bool _loading = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  @override
  void dispose() {
    _dob.dispose();
    _birthTime.dispose();
    _birthPlace.dispose();
    _nakshatra.dispose();
    _gotram.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    final api = ref.read(panchangApiProvider);
    try {
      final cities = await api.cities();
      final profile = await api.getBirthProfile();
      setState(() {
        _cities = cities.map((c) => c['name'] as String).toList();
        if (profile != null) {
          final dob = profile['dateOfBirth'] as String;
          _dob.text = dob.length >= 10 ? dob.substring(0, 10) : dob;
          _birthTime.text = (profile['birthTime'] as String?) ?? '';
          _birthPlace.text = (profile['birthPlace'] as String?) ?? '';
          _nakshatra.text = (profile['nakshatra'] as String?) ?? '';
          _gotram.text = (profile['gotram'] as String?) ?? '';
          _rasi = profile['rasi'] as String? ?? _rasi;
          _city = profile['cityName'] as String? ?? _city;
        }
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = '$e';
        _loading = false;
      });
    }
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(panchangApiProvider).saveBirthProfile({
        'dateOfBirth': _dob.text.trim(),
        if (_birthTime.text.trim().isNotEmpty)
          'birthTime': _birthTime.text.trim(),
        if (_birthPlace.text.trim().isNotEmpty)
          'birthPlace': _birthPlace.text.trim(),
        'rasi': _rasi,
        if (_nakshatra.text.trim().isNotEmpty)
          'nakshatra': _nakshatra.text.trim(),
        if (_gotram.text.trim().isNotEmpty) 'gotram': _gotram.text.trim(),
        'cityName': _city,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.birthProfileSaved)),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.birthProfile)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text(
                  'Used for daily panchang city and rasi guidance.',
                  style: TextStyle(color: Colors.black.withValues(alpha: 0.6)),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _dob,
                  decoration: const InputDecoration(
                    labelText: 'Date of birth (YYYY-MM-DD)',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _birthTime,
                  decoration: const InputDecoration(
                    labelText: 'Birth time (HH:MM, optional)',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _birthPlace,
                  decoration: const InputDecoration(
                    labelText: 'Birth place (optional)',
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _rasi,
                  decoration: const InputDecoration(labelText: 'Rasi'),
                  items: _rasiOptions
                      .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                      .toList(),
                  onChanged: (v) => setState(() => _rasi = v ?? _rasi),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _nakshatra,
                  decoration: const InputDecoration(
                    labelText: 'Nakshatra (optional)',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _gotram,
                  decoration: const InputDecoration(
                    labelText: 'Gotram (optional)',
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _cities.contains(_city) ? _city : _cities.first,
                  decoration: const InputDecoration(
                    labelText: 'City for daily panchang',
                  ),
                  items: _cities
                      .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                      .toList(),
                  onChanged: (v) => setState(() => _city = v ?? _city),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: Colors.red)),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.maroon,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: Text(_saving ? l10n.saving : l10n.saveProfile),
                ),
              ],
            ),
    );
  }
}
