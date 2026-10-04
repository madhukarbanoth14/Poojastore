import 'dart:convert';

import 'storage/secure_storage.dart';

class PendingCartAdd {
  const PendingCartAdd({
    required this.productId,
    this.selectedItemKeys,
    this.itemName,
    this.priceMinor,
    this.currency,
  });

  final String productId;
  final List<String>? selectedItemKeys;
  final String? itemName;
  final int? priceMinor;
  final String? currency;

  Map<String, dynamic> toJson() => {
        'productId': productId,
        if (selectedItemKeys != null) 'selectedItemKeys': selectedItemKeys,
        if (itemName != null) 'itemName': itemName,
        if (priceMinor != null) 'priceMinor': priceMinor,
        if (currency != null) 'currency': currency,
      };

  factory PendingCartAdd.fromJson(Map<String, dynamic> json) {
    final keys = json['selectedItemKeys'];
    return PendingCartAdd(
      productId: json['productId'] as String,
      selectedItemKeys: keys is List
          ? keys.map((item) => item.toString()).toList()
          : null,
      itemName: json['itemName'] as String?,
      priceMinor: (json['priceMinor'] as num?)?.toInt(),
      currency: json['currency'] as String?,
    );
  }
}

const _key = 'pending_cart';

Future<void> stashPendingCart(PendingCartAdd item) async {
  await secureStorage.write(key: _key, value: jsonEncode(item.toJson()));
}

Future<PendingCartAdd?> peekPendingCart() async {
  final raw = await secureStorage.read(key: _key);
  if (raw == null || raw.isEmpty) return null;
  try {
    final pending = PendingCartAdd.fromJson(
      jsonDecode(raw) as Map<String, dynamic>,
    );
    return pending.productId.isEmpty ? null : pending;
  } catch (_) {
    return null;
  }
}

Future<PendingCartAdd?> takePendingCart() async {
  final pending = await peekPendingCart();
  await secureStorage.delete(key: _key);
  return pending;
}
