import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

/// Resolves A records via UDP DNS (8.8.8.8) when the device resolver is broken.
/// Android emulators often have working IP routing but a dead 10.0.2.3 DNS.
class FallbackDns {
  FallbackDns({
    InternetAddress? server,
    this.timeout = const Duration(seconds: 3),
  }) : server = server ?? InternetAddress('8.8.8.8');

  final InternetAddress server;
  final Duration timeout;
  final _cache = <String, _DnsCacheEntry>{};

  Future<List<InternetAddress>> lookup(String host) async {
    final cached = _cache[host];
    if (cached != null && cached.expires.isAfter(DateTime.now())) {
      return cached.addresses;
    }
    try {
      final system = await InternetAddress.lookup(host);
      if (system.isNotEmpty) {
        _cache[host] = _DnsCacheEntry(
          system,
          DateTime.now().add(const Duration(minutes: 5)),
        );
        return system;
      }
    } catch (_) {}

    final viaGoogle = await lookupA(host);
    if (viaGoogle.isNotEmpty) {
      _cache[host] = _DnsCacheEntry(
        viaGoogle,
        DateTime.now().add(const Duration(minutes: 5)),
      );
    }
    return viaGoogle;
  }

  Future<List<InternetAddress>> lookupA(String host) async {
    final socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
    try {
      final id = Random().nextInt(0xffff);
      socket.send(_buildQuery(host, id), server, 53);
      await for (final event in socket.timeout(timeout)) {
        if (event == RawSocketEvent.read) {
          final packet = socket.receive()?.data;
          if (packet == null) return const [];
          return parseDnsARecords(packet);
        }
      }
      return const [];
    } on TimeoutException {
      return const [];
    } finally {
      socket.close();
    }
  }
}

class _DnsCacheEntry {
  const _DnsCacheEntry(this.addresses, this.expires);
  final List<InternetAddress> addresses;
  final DateTime expires;
}

Uint8List _buildQuery(String host, int id) {
  final builder = BytesBuilder();
  builder.add([(id >> 8) & 0xff, id & 0xff]);
  builder.add([0x01, 0x00]);
  builder.add([0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  for (final label in host.split('.')) {
    if (label.isEmpty) continue;
    final bytes = utf8.encode(label);
    builder.addByte(bytes.length);
    builder.add(bytes);
  }
  builder.addByte(0);
  builder.add([0x00, 0x01, 0x00, 0x01]);
  return builder.toBytes();
}

List<InternetAddress> parseDnsARecords(Uint8List msg) {
  if (msg.length < 12) return const [];
  final anCount = (msg[6] << 8) | msg[7];
  var offset = 12;
  offset = _skipName(msg, offset);
  offset += 4; // qtype + qclass
  final out = <InternetAddress>[];
  for (var i = 0; i < anCount && offset + 10 <= msg.length; i++) {
    offset = _skipName(msg, offset);
    if (offset + 10 > msg.length) break;
    final type = (msg[offset] << 8) | msg[offset + 1];
    final rdlength = (msg[offset + 8] << 8) | msg[offset + 9];
    offset += 10;
    if (offset + rdlength > msg.length) break;
    if (type == 1 && rdlength == 4) {
      out.add(
        InternetAddress.fromRawAddress(
          Uint8List.fromList(msg.sublist(offset, offset + 4)),
        ),
      );
    }
    offset += rdlength;
  }
  return out;
}

int _skipName(Uint8List msg, int offset) {
  while (offset < msg.length) {
    final len = msg[offset];
    if (len == 0) return offset + 1;
    if ((len & 0xc0) == 0xc0) return offset + 2;
    offset += 1 + len;
  }
  return offset;
}

class FallbackDnsHttpOverrides extends HttpOverrides {
  FallbackDnsHttpOverrides({FallbackDns? dns}) : _dns = dns ?? FallbackDns();

  final FallbackDns _dns;

  @override
  HttpClient createHttpClient(SecurityContext? context) {
    final client = super.createHttpClient(context);
    client.connectionFactory = (uri, proxyHost, proxyPort) async {
      if (proxyHost != null && proxyPort != null) {
        return Socket.startConnect(proxyHost, proxyPort);
      }
      final host = uri.host;
      final port = uri.hasPort ? uri.port : (uri.scheme == 'https' ? 443 : 80);
      final https = uri.scheme == 'https';
      try {
        if (https) {
          return await SecureSocket.startConnect(
            host,
            port,
            context: context,
          );
        }
        return await Socket.startConnect(host, port);
      } on SocketException {
        final addresses = await _dns.lookup(host);
        if (addresses.isEmpty) {
          throw SocketException('Failed host lookup: $host');
        }
        final target = addresses.firstWhere(
          (address) => address.type == InternetAddressType.IPv4,
          orElse: () => addresses.first,
        );
        // Plain TCP here; HttpClient wraps TLS using the original hostname.
        return Socket.startConnect(target, port);
      }
    };
    return client;
  }
}

String friendlyNetworkError(Object error) {
  final text = error.toString();
  if (text.contains('Failed host lookup') ||
      text.contains('SocketException') ||
      text.contains('connection error') ||
      text.contains('Connection reset') ||
      text.contains('Connection closed') ||
      text.contains('HttpException')) {
    return 'Cannot reach the server. Check internet and try again.';
  }
  return text;
}
