import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

import '../../features/marketplace/data/marketplace_api.dart';
import '../theme/app_theme.dart';
import '../widgets/ps_format.dart';
import '../widgets/ps_widgets.dart';
import 'payment_flow.dart';

Future<bool> completeOrCollectUpi({
  required BuildContext context,
  required MarketplaceApi api,
  required Map<String, dynamic> payment,
}) async {
  final kind = await completePayment(api: api, payment: payment);
  if (kind != PaymentCompletion.upi) return true;
  if (!context.mounted) return false;
  return showUpiPaySheet(context: context, api: api, payment: payment);
}

Future<bool> showUpiPaySheet({
  required BuildContext context,
  required MarketplaceApi api,
  required Map<String, dynamic> payment,
}) async {
  final submitted = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.bg,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
    ),
    builder: (ctx) => Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(ctx).bottom),
      child: UpiPaySheet(api: api, payment: payment),
    ),
  );
  return submitted == true;
}

class UpiPaySheet extends StatefulWidget {
  const UpiPaySheet({super.key, required this.api, required this.payment});

  final MarketplaceApi api;
  final Map<String, dynamic> payment;

  @override
  State<UpiPaySheet> createState() => _UpiPaySheetState();
}

class _UpiPaySheetState extends State<UpiPaySheet> {
  final _utr = TextEditingController();
  final _amountPaid = TextEditingController();
  bool _busy = false;
  bool _copied = false;
  bool _brokenCompanyQr = false;
  bool _brokenAssetQr = false;
  Uint8List? _screenshotBytes;
  String? _screenshotDataUrl;
  String? _error;

  Map<String, dynamic> get _meta =>
      Map<String, dynamic>.from((widget.payment['metadata'] as Map?) ?? const {});

  int get _amountMinor => (widget.payment['amountMinor'] as num?)?.toInt() ?? 0;

  String get _amountLabel {
    final raw = _meta['amount'];
    if (raw is String && raw.isNotEmpty) return '₹$raw';
    return formatInr(_amountMinor);
  }

  String? get _vpa {
    final vpa = _meta['vpa'] as String?;
    if (vpa == null || vpa.isEmpty) return null;
    return vpa;
  }

  String? get _upiUri {
    final uri = _meta['upiUri'] as String?;
    if (uri == null || uri.isEmpty) return null;
    return uri;
  }

  String? get _networkQrSrc {
    // Prefer dynamic amount QR — PhonePe often blocks app deep-link Pay buttons.
    final upi = _upiUri;
    if (upi != null && !_brokenCompanyQr) {
      return 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=M&data=${Uri.encodeComponent(upi)}';
    }
    final company = _meta['qrImageUrl'] as String?;
    if (company != null && company.isNotEmpty) {
      if (company.startsWith('http')) return company;
      if (company.startsWith('/images/')) {
        final origin = kReleaseMode
            ? 'https://pavitraseva.in'
            : 'http://127.0.0.1:3001';
        return '$origin$company';
      }
    }
    return null;
  }

  Widget _qrImage() {
    final src = _networkQrSrc;
    if (src != null) {
      return Image.network(
        src,
        width: 220,
        height: 220,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) {
          if (!_brokenCompanyQr) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) setState(() => _brokenCompanyQr = true);
            });
            return const SizedBox(
              width: 220,
              height: 220,
              child: Center(child: CircularProgressIndicator()),
            );
          }
          if (!_brokenAssetQr) {
            return Image.asset(
              'assets/images/payments/company-upi-qr.jpeg',
              width: 220,
              height: 220,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted && !_brokenAssetQr) {
                    setState(() => _brokenAssetQr = true);
                  }
                });
                return const SizedBox(
                  width: 220,
                  height: 72,
                  child: Center(
                    child: Text(
                      'QR unavailable — use UPI ID',
                      textAlign: TextAlign.center,
                    ),
                  ),
                );
              },
            );
          }
          return const SizedBox(
            width: 220,
            height: 72,
            child: Center(
              child: Text(
                'QR unavailable — use UPI ID',
                textAlign: TextAlign.center,
              ),
            ),
          );
        },
      );
    }
    if (!_brokenAssetQr) {
      return Image.asset(
        'assets/images/payments/company-upi-qr.jpeg',
        width: 220,
        height: 220,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted && !_brokenAssetQr) {
              setState(() => _brokenAssetQr = true);
            }
          });
          return const SizedBox(
            width: 220,
            height: 72,
            child: Center(
              child: Text(
                'QR unavailable — use UPI ID',
                textAlign: TextAlign.center,
              ),
            ),
          );
        },
      );
    }
    return const SizedBox(
      width: 220,
      height: 72,
      child: Center(
        child: Text(
          'QR unavailable — use UPI ID',
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _utr.dispose();
    _amountPaid.dispose();
    super.dispose();
  }

  int? _parseAmountMinor(String raw) {
    final cleaned = raw.trim().replaceAll(',', '').replaceFirst(RegExp(r'^₹\s?'), '');
    if (cleaned.isEmpty) return null;
    if (!RegExp(r'^\d+(\.\d{1,2})?$').hasMatch(cleaned)) return null;
    final rupees = double.tryParse(cleaned);
    if (rupees == null || rupees <= 0) return null;
    return (rupees * 100).round();
  }

  String _normalizeUtr(String raw) =>
      raw.trim().replaceAll(RegExp(r'[\s-]'), '');

  String? _clientUtrError(String utr) {
    if (!RegExp(r'^\d{12}$').hasMatch(utr)) {
      return 'Enter the exact 12-digit UTR from PhonePe / Google Pay / Paytm. This reference is not valid.';
    }
    if (RegExp(r'^(\d)\1{11}$').hasMatch(utr) ||
        utr == '123456789012' ||
        utr == '000000000000') {
      return 'This UTR does not look like a real payment reference. Copy it from your payment success screen.';
    }
    return null;
  }

  Future<void> _pickScreenshot() async {
    final file = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 55,
      maxWidth: 1280,
    );
    if (file == null) return;
    final bytes = await file.readAsBytes();
    if (bytes.length > 900000) {
      if (mounted) {
        setState(() => _error = 'Screenshot is too large — enter the UTR only');
      }
      return;
    }
    if (!mounted) return;
    setState(() {
      _screenshotBytes = bytes;
      _screenshotDataUrl = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      _error = null;
    });
  }

  Future<void> _copyVpa() async {
    final vpa = _vpa;
    if (vpa == null) return;
    await Clipboard.setData(ClipboardData(text: vpa));
    if (mounted) setState(() => _copied = true);
  }

  Future<void> _submit() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final utr = _normalizeUtr(_utr.text);
      final utrError = _clientUtrError(utr);
      if (utrError != null) throw StateError(utrError);
      final amountPaidMinor = _parseAmountMinor(_amountPaid.text);
      if (amountPaidMinor == null) {
        throw StateError('Enter the amount you paid (must match the QR amount).');
      }
      if (amountPaidMinor != _amountMinor) {
        throw StateError(
          'Amount does not match this order (expected $_amountLabel). Use the UTR from the payment of this exact amount — other UTRs are not accepted.',
        );
      }
      await widget.api.submitUpiUtr(
        paymentId: widget.payment['id'] as String,
        utr: utr,
        amountPaidMinor: amountPaidMinor,
        screenshotBase64: _screenshotDataUrl,
      );
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceFirst('Bad state: ', ''));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 42,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Pay with UPI',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 18,
                color: AppColors.maroon,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Pay $_amountLabel by scanning this QR in PhonePe, Google Pay, or Paytm. We only accept QR payments — no in-app Pay links.',
              style: const TextStyle(color: AppColors.textMuted, height: 1.4),
            ),
            const SizedBox(height: 16),
            Center(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.divider),
                ),
                child: _qrImage(),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              _amountLabel,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: AppColors.maroon,
              ),
            ),
            if (_vpa != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'UPI ID',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.4,
                              color: AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _vpa!,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: AppColors.maroon,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: _copyVpa,
                      child: Text(_copied ? 'Copied' : 'Copy'),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 14),
            const Text(
              'Amount paid (₹)',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _amountPaid,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                hintText: 'Must be ${_amountLabel.replaceFirst('₹', '').trim()}',
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 12),
            const Text(
              'UPI reference / UTR',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _utr,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                hintText: '12-digit UTR from your payment app',
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: _pickScreenshot,
              child: Text(
                _screenshotBytes == null
                    ? 'Upload payment screenshot (optional)'
                    : 'Change screenshot',
              ),
            ),
            if (_screenshotBytes != null) ...[
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.memory(
                  _screenshotBytes!,
                  height: 140,
                  fit: BoxFit.cover,
                ),
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: const TextStyle(color: AppColors.orange)),
            ],
            const SizedBox(height: 12),
            PsSaffronButton(
              label: _busy ? 'Checking…' : 'I have paid',
              loading: _busy,
              onPressed: _normalizeUtr(_utr.text).length == 12 &&
                      _parseAmountMinor(_amountPaid.text) != null
                  ? _submit
                  : null,
            ),
            const SizedBox(height: 10),
            const Text(
              'Wrong UTRs or UTRs from a different amount are rejected immediately.',
              style: TextStyle(fontSize: 12, color: AppColors.textMuted, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}
