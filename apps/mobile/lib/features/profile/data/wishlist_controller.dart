import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _wishlistKey = 'ps_wishlist';

class WishlistController extends StateNotifier<Set<String>> {
  WishlistController(this._storage) : super(const {}) {
    _restore();
  }

  final FlutterSecureStorage _storage;

  Future<void> _restore() async {
    final raw = await _storage.read(key: _wishlistKey);
    if (raw == null || raw.isEmpty) return;
    state = raw.split(',').where((e) => e.isNotEmpty).toSet();
  }

  Future<void> seedIfEmpty(Iterable<String> slugs) async {
    if (state.isNotEmpty) return;
    final next = slugs.where((e) => e.isNotEmpty).take(2).toSet();
    if (next.isEmpty) return;
    state = next;
    await _persist();
  }

  Future<void> toggle(String slug) async {
    final next = {...state};
    if (!next.add(slug)) next.remove(slug);
    state = next;
    await _persist();
  }

  Future<void> _persist() async {
    await _storage.write(key: _wishlistKey, value: state.join(','));
  }
}

final wishlistControllerProvider =
    StateNotifierProvider<WishlistController, Set<String>>((ref) {
  return WishlistController(const FlutterSecureStorage());
});
