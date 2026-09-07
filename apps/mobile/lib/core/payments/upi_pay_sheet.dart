import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';

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
    super.dispose();
  }

  String? _metaUri(String key) {
    final value = _meta[key] as String?;
    if (value == null || value.isEmpty) return null;
    return value;
  }

  Future<void> _openUris(List<String?> uris) async {
    for (final raw in uris) {
      if (raw == null || raw.isEmpty) continue;
      try {
        final uri = Uri.parse(raw);
        if (await launchUrl(uri, mode: LaunchMode.externalApplication)) return;
      } catch (_) {}
    }
    if (mounted) {
      setState(() {
        _error =
            'Install PhonePe, Google Pay, or Paytm to pay from this phone.';
      });
    }
  }

  Future<void> _pickScreenshot() async {
    final file = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 70,
      maxWidth: 1600,
    );
    if (file == null) return;
    final bytes = await file.readAsBytes();
    if (bytes.length > 2000000) {
      if (mounted) setState(() => _error = 'Screenshot must be under 2 MB');
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

  Future<void> _openUpi() async {
    // Standard upi:// only — PhonePe declines phonepe://pay deep links.
    await _openUris([_upiUri]);
  }

  Future<void> _submit() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.api.submitUpiUtr(
        paymentId: widget.payment['id'] as String,
        utr: _utr.text.trim().isEmpty ? null : _utr.text,
        screenshotBase64: _screenshotDataUrl,
      );
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
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
              'Pay $_amountLabel by scanning this QR in PhonePe, Google Pay, or Paytm. PhonePe often blocks in-app Pay buttons — QR or UPI ID works reliably.',
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
            if (_upiUri != null) ...[
              const SizedBox(height: 10),
              OutlinedButton(
                onPressed: _openUpi,
                child: const Text('Open UPI app (if QR scan is not possible)'),
              ),
            ],
            const SizedBox(height: 14),
            const Text(
              'UPI reference / UTR (optional if you upload a screenshot)',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _utr,
              textCapitalization: TextCapitalization.characters,
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
                    ? 'Upload payment screenshot'
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
              label: _busy ? 'Saving…' : 'I have paid',
              loading: _busy,
              onPressed:
                  _utr.text.trim().length >= 8 || _screenshotDataUrl != null
                      ? _submit
                      : null,
            ),
            const SizedBox(height: 10),
            const Text(
              'Enter the UTR or upload the payment screenshot. We confirm the credit, then pack the order.',
              style: TextStyle(fontSize: 12, color: AppColors.textMuted, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}
