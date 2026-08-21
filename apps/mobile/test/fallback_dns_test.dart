import 'dart:io';
import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import 'package:pooja_store_mobile/core/network/fallback_dns.dart';

void main() {
  test('parses a DNS A answer', () {
    // Minimal: header + question google.com + one A 8.8.8.8
    final msg = Uint8List.fromList([
      0x12, 0x34, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
      6, 103, 111, 111, 103, 108, 101, 3, 99, 111, 109, 0,
      0x00, 0x01, 0x00, 0x01,
      0xc0, 0x0c, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x3c, 0x00, 0x04,
      8, 8, 8, 8,
    ]);
    final addrs = parseDnsARecords(msg);
    expect(addrs, hasLength(1));
    expect(addrs.first, InternetAddress('8.8.8.8'));
  });
}
