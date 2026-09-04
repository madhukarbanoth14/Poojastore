import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/ensure_logged_in.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import 'kits_screen.dart';
import 'samagri_scan_screen.dart';

class PoojariSamagriComposeScreen extends ConsumerStatefulWidget {
  const PoojariSamagriComposeScreen({
    super.key,
    required this.bookingId,
    this.devoteeName,
    this.serviceName,
  });

  final String bookingId;
  final String? devoteeName;
  final String? serviceName;

  @override
  ConsumerState<PoojariSamagriComposeScreen> createState() =>
      _PoojariSamagriComposeScreenState();
}

class _PoojariSamagriComposeScreenState
    extends ConsumerState<PoojariSamagriComposeScreen> {
  final _textController = TextEditingController();
  final _selected = <String>{};
  final _quantities = <String, int>{};

  bool _loading = false;
  bool _sending = false;
  String? _error;
  String _rawText = '';
  List<Map<String, dynamic>> _matches = const [];
  List<String> _unmatched = const [];
  List<Map<String, dynamic>> _unmatchedSuggestions = const [];

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _matchText() async {
    final text = _textController.text.trim();
    if (text.isEmpty) {
      setState(() => _error = context.l10n.scanListEmptyError);
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
      _matches = const [];
      _unmatched = const [];
      _unmatchedSuggestions = const [];
      _selected.clear();
      _quantities.clear();
    });

    try {
      final data = await ref.read(samagriScanApiProvider).scanText(text);
      if (!mounted) return;
      final matches =
          (data['matches'] as List?)?.cast<Map<String, dynamic>>() ?? const [];
      setState(() {
        _rawText = data['rawText'] as String? ?? text;
        _matches = matches;
        _unmatched =
            (data['unmatchedLines'] as List?)?.cast<String>() ?? const [];
        _unmatchedSuggestions =
            (data['unmatchedSuggestions'] as List?)?.cast<Map<String, dynamic>>() ??
                const [];
        _loading = false;
        _selected.addAll(
          matches.map((m) => m['productId'] as String?).whereType<String>(),
        );
        for (final match in matches) {
          final id = match['productId'] as String?;
          if (id == null) continue;
          _quantities[id] = match['quantity'] as int? ?? 1;
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = friendlyNetworkError(e);
        _loading = false;
      });
    }
  }

  int _qtyFor(String productId, Map<String, dynamic> match) =>
      _quantities[productId] ?? match['quantity'] as int? ?? 1;

  void _setQty(String productId, int qty) {
    setState(() => _quantities[productId] = qty.clamp(1, 20));
  }

  void _addSuggestion(Map<String, dynamic> suggestion, String line) {
    final id = suggestion['productId'] as String;
    setState(() {
      if (!_matches.any((m) => m['productId'] == id)) {
        _matches = [
          ..._matches,
          {
            'productId': id,
            'slug': suggestion['slug'],
            'nameEn': suggestion['nameEn'],
            'nameTe': suggestion['nameTe'],
            'priceMinor': suggestion['priceMinor'],
            'confidence': suggestion['score'],
            'matchedText': line,
            'quantity': 1,
          },
        ];
      }
      _selected.add(id);
      _quantities.putIfAbsent(id, () => 1);
      _unmatched = _unmatched.where((item) => item != line).toList();
      _unmatchedSuggestions = _unmatchedSuggestions
          .where((row) => row['line'] != line)
          .toList();
    });
  }

  Future<void> _sendToDevotee() async {
    if (_selected.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.scanSelectItemsError)),
      );
      return;
    }

    setState(() => _sending = true);
    try {
      final items = _matches
          .where((m) => _selected.contains(m['productId']))
          .map((m) {
            final id = m['productId'] as String;
            return {
              'productId': id,
              'slug': m['slug'],
              'nameEn': m['nameEn'],
              'nameTe': m['nameTe'],
              'priceMinor': m['priceMinor'],
              'quantity': _qtyFor(id, m),
            };
          })
          .toList();

      await ref.read(samagriScanApiProvider).sendPoojariListFromItems(
            bookingId: widget.bookingId,
            items: items,
            rawText: _rawText.isNotEmpty ? _rawText : _textController.text.trim(),
            title: widget.serviceName,
          );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.poojariSamagriSent)),
      );
      context.pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(friendlyNetworkError(e))),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final te = context.isTelugu;
    final devotee = widget.devoteeName?.trim();
    final hasResults = _matches.isNotEmpty || _rawText.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(
        title: l10n.poojariSamagriTitle,
        showBack: true,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        children: [
          Text(
            devotee != null && devotee.isNotEmpty
                ? l10n.poojariSamagriIntroFor(devotee)
                : l10n.poojariSamagriIntro,
            style: const TextStyle(
              color: AppColors.textMuted,
              height: 1.45,
              fontSize: 13.5,
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _textController,
            minLines: 5,
            maxLines: 10,
            decoration: InputDecoration(
              labelText: l10n.scanPasteListLabel,
              hintText: l10n.scanPasteListHint,
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _loading ? null : _matchText,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.maroon,
              minimumSize: const Size.fromHeight(46),
            ),
            icon: const Icon(Icons.search),
            label: Text(l10n.scanFindItems),
          ),
          if (_loading) ...[
            const SizedBox(height: 24),
            const Center(child: CircularProgressIndicator()),
          ],
          if (_error != null) ...[
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
          if (hasResults) ...[
            const SizedBox(height: 24),
            Text(
              l10n.scanMatchedItems(_matches.length),
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14.5,
              ),
            ),
            const SizedBox(height: 10),
            if (_matches.isEmpty)
              Text(
                l10n.scanNoMatches,
                style: const TextStyle(color: AppColors.textMuted),
              )
            else
              ..._matches.map((match) {
                final id = match['productId'] as String;
                final nameEn = match['nameEn'] as String? ?? '';
                final nameTe = match['nameTe'] as String? ?? '';
                final displayName = te && nameTe.isNotEmpty ? nameTe : nameEn;
                final selected = _selected.contains(id);
                final qty = _qtyFor(id, match);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: PsCard(
                    onTap: () => setState(() {
                      if (selected) {
                        _selected.remove(id);
                      } else {
                        _selected.add(id);
                      }
                    }),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Checkbox(
                          value: selected,
                          activeColor: AppColors.maroon,
                          onChanged: (value) => setState(() {
                            if (value == true) {
                              _selected.add(id);
                            } else {
                              _selected.remove(id);
                            }
                          }),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                displayName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Text(
                                    l10n.scanQty,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    onPressed: qty > 1
                                        ? () => _setQty(id, qty - 1)
                                        : null,
                                    icon: const Icon(Icons.remove_circle_outline),
                                  ),
                                  Text('$qty'),
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    onPressed: qty < 20
                                        ? () => _setQty(id, qty + 1)
                                        : null,
                                    icon: const Icon(Icons.add_circle_outline),
                                  ),
                                  const Spacer(),
                                  Text(
                                    formatInr(match['priceMinor'] as int? ?? 0),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            if (_unmatched.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                l10n.scanUnmatchedLines,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              ..._unmatched.map((line) {
                final row = _unmatchedSuggestions.firstWhere(
                  (item) => item['line'] == line,
                  orElse: () => const {},
                );
                final suggestions =
                    (row['suggestions'] as List?)?.cast<Map<String, dynamic>>() ??
                        const [];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: PsCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(line),
                        if (suggestions.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(
                            l10n.scanDidYouMean,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textMuted,
                            ),
                          ),
                          Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            children: suggestions.map((s) {
                              final label = te &&
                                      (s['nameTe'] as String?)?.isNotEmpty == true
                                  ? s['nameTe'] as String
                                  : s['nameEn'] as String? ?? '';
                              return ActionChip(
                                label: Text(label),
                                onPressed: () => _addSuggestion(s, line),
                              );
                            }).toList(),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              }),
            ],
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _sending ? null : _sendToDevotee,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: AppColors.maroonDeep,
                minimumSize: const Size.fromHeight(48),
              ),
              child: _sending
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(l10n.poojariSamagriSend),
            ),
          ],
        ],
      ),
    );
  }
}

class SamagriReceivedScreen extends ConsumerStatefulWidget {
  const SamagriReceivedScreen({super.key, required this.listId});

  final String listId;

  @override
  ConsumerState<SamagriReceivedScreen> createState() =>
      _SamagriReceivedScreenState();
}

class _SamagriReceivedScreenState extends ConsumerState<SamagriReceivedScreen> {
  final _selected = <String>{};
  final _quantities = <String, int>{};

  bool _loading = true;
  bool _adding = false;
  String? _error;
  Map<String, dynamic>? _data;
  List<Map<String, dynamic>> _matches = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data =
          await ref.read(samagriScanApiProvider).loadReceivedList(widget.listId);
      if (!mounted) return;
      final matches =
          (data['matches'] as List?)?.cast<Map<String, dynamic>>() ?? const [];
      setState(() {
        _data = data;
        _matches = matches;
        _loading = false;
        _selected
          ..clear()
          ..addAll(
            matches.map((m) => m['productId'] as String?).whereType<String>(),
          );
        _quantities.clear();
        for (final match in matches) {
          final id = match['productId'] as String?;
          if (id == null) continue;
          _quantities[id] = match['quantity'] as int? ?? 1;
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = friendlyNetworkError(e);
        _loading = false;
      });
    }
  }

  int _qtyFor(String productId, Map<String, dynamic> match) =>
      _quantities[productId] ?? match['quantity'] as int? ?? 1;

  void _setQty(String productId, int qty) {
    setState(() => _quantities[productId] = qty.clamp(1, 20));
  }

  int get _totalMinor {
    var total = 0;
    for (final match in _matches) {
      final id = match['productId'] as String?;
      if (id == null || !_selected.contains(id)) continue;
      total += (match['priceMinor'] as int? ?? 0) * _qtyFor(id, match);
    }
    return total;
  }

  Future<void> _addSelectedToCart() async {
    if (_selected.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.scanSelectItemsError)),
      );
      return;
    }

    final loggedIn = await ensureLoggedIn(
      context,
      ref,
      message: context.l10n.scanSignInToAdd,
    );
    if (!loggedIn || !mounted) return;

    setState(() => _adding = true);
    try {
      final api = ref.read(marketplaceApiProvider);
      for (final match in _matches) {
        final id = match['productId'] as String?;
        if (id == null || !_selected.contains(id)) continue;
        await api.addToCart(id, qty: _qtyFor(id, match));
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.scanAddedToCart)),
      );
      context.push('/cart');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(friendlyNetworkError(e))),
      );
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final te = context.isTelugu;
    final data = _data;
    final bottom = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(
        title: data?['title'] as String? ?? l10n.receivedSamagriTitle,
        showBack: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : ListView(
                  padding: EdgeInsets.fromLTRB(20, 16, 20, 24 + bottom),
                  children: [
                    Text(
                      l10n.receivedSamagriFrom(
                        data?['priestName'] as String? ?? '',
                      ),
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 13.5,
                      ),
                    ),
                    if ((data?['serviceName'] as String?)?.isNotEmpty == true) ...[
                      const SizedBox(height: 4),
                      Text(
                        data!['serviceName'] as String,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 13.5,
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    Text(
                      l10n.scanMatchedItems(_matches.length),
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14.5,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ..._matches.map((match) {
                      final id = match['productId'] as String;
                      final nameEn = match['nameEn'] as String? ?? '';
                      final nameTe = match['nameTe'] as String? ?? '';
                      final displayName = te && nameTe.isNotEmpty ? nameTe : nameEn;
                      final selected = _selected.contains(id);
                      final qty = _qtyFor(id, match);
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: PsCard(
                          onTap: () => setState(() {
                            if (selected) {
                              _selected.remove(id);
                            } else {
                              _selected.add(id);
                            }
                          }),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Checkbox(
                                value: selected,
                                activeColor: AppColors.maroon,
                                onChanged: (value) => setState(() {
                                  if (value == true) {
                                    _selected.add(id);
                                  } else {
                                    _selected.remove(id);
                                  }
                                }),
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      displayName,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 14,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Text(
                                          l10n.scanQty,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: AppColors.textMuted,
                                          ),
                                        ),
                                        IconButton(
                                          visualDensity: VisualDensity.compact,
                                          onPressed: qty > 1
                                              ? () => _setQty(id, qty - 1)
                                              : null,
                                          icon: const Icon(Icons.remove_circle_outline),
                                        ),
                                        Text('$qty'),
                                        IconButton(
                                          visualDensity: VisualDensity.compact,
                                          onPressed: qty < 20
                                              ? () => _setQty(id, qty + 1)
                                              : null,
                                          icon: const Icon(Icons.add_circle_outline),
                                        ),
                                        const Spacer(),
                                        Text(
                                          formatInr(
                                            match['priceMinor'] as int? ?? 0,
                                          ),
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 16),
                    Text(
                      l10n.scanSelectedTotal(formatInr(_totalMinor)),
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: _adding ? null : _addSelectedToCart,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.maroon,
                        minimumSize: const Size.fromHeight(48),
                      ),
                      child: _adding
                          ? Text(l10n.addingToCart)
                          : Text(l10n.scanAddToCart),
                    ),
                  ],
                ),
    );
  }
}
