import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../data/priests_api.dart';

Future<void> openConsultation(
  BuildContext context,
  WidgetRef ref, {
  required String bookingId,
  String? peerName,
}) async {
  final join = await ref.read(priestsApiProvider).joinBooking(bookingId);
  if (!context.mounted) return;

  if (join['meetingProvider'] == 'agora' && join['agora'] != null) {
    final name =
        (join['peerName'] as String?) ?? peerName ?? 'Panditji';
    context.push(
      '/consultation/$bookingId?name=${Uri.encodeComponent(name)}',
    );
    return;
  }

  final url = (join['meetingJoinUrl'] as String?) ??
      (join['meetingHostUrl'] as String?);
  if (url == null) {
    throw StateError('No meeting link is available yet');
  }
  final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  if (!ok && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Open this link: $url')),
    );
  }
}
