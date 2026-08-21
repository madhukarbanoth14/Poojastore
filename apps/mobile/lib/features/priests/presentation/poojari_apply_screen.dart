import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../core/network/fallback_dns.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/priests_api.dart';

const _languages = ['Telugu', 'Hindi', 'English', 'Kannada', 'Sanskrit'];
const _poojas = [
  'Ganesh Homam',
  'Varalakshmi Vratam',
  'Satyanarayan Vratham',
  'Griha Pravesh',
  'Wedding',
  'Namakaranam',
  'Homam',
];

class _PoojaFeeFields {
  _PoojaFeeFields()
      : home = TextEditingController(text: '1500'),
        online = TextEditingController(text: '800');

  final TextEditingController home;
  final TextEditingController online;

  void dispose() {
    home.dispose();
    online.dispose();
  }
}

class PoojariApplyScreen extends ConsumerStatefulWidget {
  const PoojariApplyScreen({super.key});

  @override
  ConsumerState<PoojariApplyScreen> createState() => _PoojariApplyScreenState();
}

class _PoojariApplyScreenState extends ConsumerState<PoojariApplyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _city = TextEditingController();
  final _state = TextEditingController(text: 'Telangana');
  final _years = TextEditingController();
  final _bio = TextEditingController();
  final _selectedLangs = <String>{'Telugu'};
  final _selectedPoojas = <String>{'Ganesh Homam', 'Varalakshmi Vratam'};
  final _fees = <String, _PoojaFeeFields>{};
  bool _offersHome = true;
  bool _offersOnline = true;
  bool _submitting = false;
  bool _done = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).user;
    if (user?.fullName != null) _name.text = user!.fullName!;
    final phone = user?.phoneE164 ?? '';
    if (phone.startsWith('+91') && phone.length >= 13) {
      _phone.text = phone.substring(3);
    }
    for (final pooja in _selectedPoojas) {
      _fees[pooja] = _PoojaFeeFields();
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _city.dispose();
    _state.dispose();
    _years.dispose();
    _bio.dispose();
    for (final fee in _fees.values) {
      fee.dispose();
    }
    super.dispose();
  }

  void _togglePooja(String pooja) {
    setState(() {
      if (_selectedPoojas.contains(pooja)) {
        _selectedPoojas.remove(pooja);
        _fees.remove(pooja)?.dispose();
      } else {
        _selectedPoojas.add(pooja);
        _fees[pooja] = _PoojaFeeFields();
      }
    });
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_selectedLangs.isEmpty || _selectedPoojas.isEmpty) {
      setState(() => _error = 'Choose at least one language and one pooja.');
      return;
    }
    if (!_offersHome && !_offersOnline) {
      setState(
        () => _error = 'Select home visits, online consultations, or both.',
      );
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final serviceFees = _selectedPoojas.map((pooja) {
        final fields = _fees[pooja]!;
        return {
          'pooja': pooja,
          if (_offersHome) 'homeVisitInr': int.parse(fields.home.text.trim()),
          if (_offersOnline) 'onlineInr': int.parse(fields.online.text.trim()),
        };
      }).toList();
      await ref.read(priestsApiProvider).applyAsPujari({
        'fullName': _name.text.trim(),
        'countryCode': '91',
        'phone': _phone.text.trim(),
        'city': _city.text.trim(),
        'state': _state.text.trim(),
        'languages': _selectedLangs.toList(),
        'serviceFees': serviceFees,
        'yearsExperience': int.parse(_years.text.trim()),
        'bio': _bio.text.trim(),
        'offersHome': _offersHome,
        'offersOnline': _offersOnline,
      });
      if (!mounted) return;
      setState(() {
        _done = true;
        _submitting = false;
      });
    } on DioException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = _describeError(error);
        _submitting = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = friendlyNetworkError(error);
        _submitting = false;
      });
    }
  }

  String _describeError(DioException error) {
    final data = error.response?.data;
    if (data is Map) {
      final message = data['message'];
      if (message is List && message.isNotEmpty) {
        return message.map((item) => '$item').join('\n');
      }
      if (message != null && '$message'.trim().isNotEmpty) {
        return '$message';
      }
      final nested = data['error'];
      if (nested != null && '$nested'.trim().isNotEmpty) {
        return '$nested';
      }
    }
    if (data is String && data.trim().isNotEmpty) {
      return data.length > 180 ? 'Server error. Please try again.' : data;
    }
    return friendlyNetworkError(error);
  }

  @override
  Widget build(BuildContext context) {
    if (_done) {
      return Scaffold(
        backgroundColor: AppColors.bg,
        appBar: const PsHeader(title: 'Join as a pujari'),
        body: Padding(
          padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Application received',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 22,
                  color: AppColors.text,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Thank you. Our team will review your details and add you to Pooja Store so devotees can book you for home visits and online consultations.',
                style: TextStyle(
                  fontSize: 14.5,
                  height: 1.5,
                  color: AppColors.body,
                ),
              ),
              const Spacer(),
              TerracottaButton(
                label: 'Back',
                onPressed: () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go('/login');
                  }
                },
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const PsHeader(title: 'Join as a pujari'),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          children: [
            const Text(
              'Tell us about your seva so we can list you for home puja and online consultations.',
              style: TextStyle(
                fontSize: 13.5,
                height: 1.45,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 18),
            _field(_name, 'Full name', 'Pandit Srikanth Iyengar'),
            _field(
              _phone,
              'Mobile number',
              '98765 43210',
              keyboard: TextInputType.phone,
              digits: 10,
            ),
            Row(
              children: [
                Expanded(child: _field(_city, 'City', 'Hyderabad')),
                const SizedBox(width: 10),
                Expanded(child: _field(_state, 'State', 'Telangana')),
              ],
            ),
            _field(
              _years,
              'Years of experience',
              '12',
              keyboard: TextInputType.number,
              digits: 2,
            ),
            _area(
              _bio,
              'About your practice',
              'Vedic rituals, Telugu homams, and family ceremonies...',
            ),
            const SizedBox(height: 8),
            const Text(
              'Languages',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: AppColors.maroonDeep,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final lang in _languages)
                  _chip(lang, _selectedLangs.contains(lang), () {
                    setState(() {
                      if (_selectedLangs.contains(lang)) {
                        _selectedLangs.remove(lang);
                      } else {
                        _selectedLangs.add(lang);
                      }
                    });
                  }),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Poojas you perform',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: AppColors.maroonDeep,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final pooja in _poojas)
                  _chip(pooja, _selectedPoojas.contains(pooja), () {
                    _togglePooja(pooja);
                  }),
              ],
            ),
            SwitchListTile.adaptive(
              contentPadding: EdgeInsets.zero,
              title: const Text(
                'Home visits',
                style: TextStyle(
                  color: AppColors.text,
                  fontWeight: FontWeight.w600,
                ),
              ),
              value: _offersHome,
              activeThumbColor: AppColors.saffron,
              onChanged: (value) => setState(() => _offersHome = value),
            ),
            SwitchListTile.adaptive(
              contentPadding: EdgeInsets.zero,
              title: const Text(
                'Online video consultations',
                style: TextStyle(
                  color: AppColors.text,
                  fontWeight: FontWeight.w600,
                ),
              ),
              value: _offersOnline,
              activeThumbColor: AppColors.saffron,
              onChanged: (value) => setState(() => _offersOnline = value),
            ),
            if (_selectedPoojas.isNotEmpty) ...[
              const SizedBox(height: 8),
              const Text(
                'Price for each pooja',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                  color: AppColors.maroonDeep,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Set a home-visit price and an online consultation price for every pooja you selected.',
                style: TextStyle(
                  fontSize: 12.5,
                  height: 1.4,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 12),
              for (final pooja in _poojas)
                if (_selectedPoojas.contains(pooja)) _poojaFeeCard(pooja),
            ],
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: const TextStyle(color: Colors.redAccent)),
            ],
            const SizedBox(height: 12),
            TerracottaButton(
              label: 'Submit application',
              onPressed: _submitting ? null : _submit,
              loading: _submitting,
            ),
          ],
        ),
      ),
    );
  }

  Widget _poojaFeeCard(String pooja) {
    final fields = _fees[pooja]!;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 4),
        decoration: BoxDecoration(
          color: AppColors.blush,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              pooja,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14,
                color: AppColors.text,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                if (_offersHome)
                  Expanded(
                    child: _field(
                      fields.home,
                      'Home visit (₹)',
                      '1500',
                      keyboard: TextInputType.number,
                      digits: 5,
                    ),
                  ),
                if (_offersHome && _offersOnline) const SizedBox(width: 10),
                if (_offersOnline)
                  Expanded(
                    child: _field(
                      fields.online,
                      'Online consult (₹)',
                      '800',
                      keyboard: TextInputType.number,
                      digits: 5,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(
    TextEditingController controller,
    String label,
    String hint, {
    TextInputType keyboard = TextInputType.text,
    int? digits,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboard,
        inputFormatters: [
          if (digits != null) FilteringTextInputFormatter.digitsOnly,
          if (digits != null) LengthLimitingTextInputFormatter(digits),
        ],
        validator: (value) {
          final text = value?.trim() ?? '';
          if (text.isEmpty) return 'Required';
          if (label == 'Full name' && text.length < 3) {
            return 'Enter your full name';
          }
          if (label == 'Mobile number' &&
              !RegExp(r'^[6-9]\d{9}$').hasMatch(text)) {
            return 'Enter a valid 10-digit number';
          }
          if (label.contains('₹') && int.tryParse(text) == null) {
            return 'Enter rupees';
          }
          if (label.contains('₹')) {
            final amount = int.tryParse(text) ?? 0;
            if (amount < 300) return 'Min ₹300';
          }
          if (label.startsWith('Years') && int.tryParse(text) == null) {
            return 'Enter years';
          }
          return null;
        },
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          filled: true,
          fillColor: Colors.white,
        ),
      ),
    );
  }

  Widget _area(TextEditingController controller, String label, String hint) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        minLines: 4,
        maxLines: 6,
        validator: (value) {
          final text = value?.trim() ?? '';
          if (text.length < 20) {
            return 'Write a short introduction (20+ characters)';
          }
          return null;
        },
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          alignLabelWithHint: true,
          filled: true,
          fillColor: Colors.white,
        ),
      ),
    );
  }

  Widget _chip(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.maroonDeep : AppColors.blush,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppColors.maroonDeep : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w600,
            color: selected ? AppColors.cream : AppColors.text,
          ),
        ),
      ),
    );
  }
}
