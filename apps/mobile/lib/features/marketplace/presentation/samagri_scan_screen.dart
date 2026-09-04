import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/auth/ensure_logged_in.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../data/samagri_scan_api.dart';
import 'kits_screen.dart';

final samagriScanApiProvider = Provider(
  (ref) => SamagriScanApi(ref.watch(apiClientProvider)),
);

class SamagriScanScreen extends ConsumerStatefulWidget {
  const SamagriScanScreen({super.key});

  @override
  ConsumerState<SamagriScanScreen> createState() => _SamagriScanScreenState();
}

class _SamagriScanScreenState extends ConsumerState<SamagriScanScreen> {
  final _picker = ImagePicker();
  final _textController = TextEditingController();
  final _selected = <String>{};
  final _quantities = <String, int>{};

  bool _loading = false;
  bool _adding = false;
  bool _savingList = false;
  String? _error;
  String _rawText = '';
  List<Map<String, dynamic>> _matches = const [];
  List<String> _unmatched = const [];
  List<Map<String, dynamic>> _unmatchedSuggestions = const [];
  List<Map<String, dynamic>> _savedLists = const [];
  File? _preview;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadSavedLists());
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _loadSavedLists() async {
    final auth = ref.read(authControllerProvider);
    if (!auth.isAuthenticated) return;
    try {
      final items = await ref.read(samagriScanApiProvider).listSavedLists();
      if (!mounted) return;
      setState(() => _savedLists = items);
    } catch (_) {}
  }

  Future<void> _scanFromImage(ImageSource source) async {
    final picked = await _picker.pickImage(
      source: source,
      maxWidth: 2400,
      imageQuality: 92,
    );
    if (picked == null || !mounted) return;

    setState(() {
      _loading = true;
      _error = null;
      _preview = File(picked.path);
      _clearResults();
    });

    try {
      final data =
          await ref.read(samagriScanApiProvider).scanImage(File(picked.path));
      if (!mounted) return;
      _applyResult(data);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = friendlyNetworkError(e);
        _loading = false;
      });
    }
  }

  Future<void> _scanFromText() async {
    final text = _textController.text.trim();
    if (text.isEmpty) {
      setState(() => _error = context.l10n.scanListEmptyError);
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
      _preview = null;
      _clearResults();
    });

    try {
      final data = await ref.read(samagriScanApiProvider).scanText(text);
      if (!mounted) return;
      _applyResult(data);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = friendlyNetworkError(e);
        _loading = false;
      });
    }
  }

  Future<void> _loadSavedList(String id) async {
    setState(() {
      _loading = true;
      _error = null;
      _clearResults();
    });
    try {
      final data = await ref.read(samagriScanApiProvider).loadSavedList(id);
      if (!mounted) return;
      _applyResult(data);
      final raw = data['rawText'] as String? ?? '';
      if (raw.isNotEmpty) _textController.text = raw;
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = friendlyNetworkError(e);
        _loading = false;
      });
    }
  }

  void _clearResults() {
    _matches = const [];
    _unmatched = const [];
    _unmatchedSuggestions = const [];
    _rawText = '';
    _selected.clear();
    _quantities.clear();
  }

  void _applyResult(Map<String, dynamic> data) {
    final matches =
        (data['matches'] as List?)?.cast<Map<String, dynamic>>() ?? const [];
    setState(() {
      _rawText = data['rawText'] as String? ?? '';
      _matches = matches;
      _unmatched =
          (data['unmatchedLines'] as List?)?.cast<String>() ?? const [];
      _unmatchedSuggestions =
          (data['unmatchedSuggestions'] as List?)?.cast<Map<String, dynamic>>() ??
              const [];
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

  Future<void> _saveList() async {
    if (_selected.isEmpty || _matches.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.scanSelectItemsError)),
      );
      return;
    }

    final loggedIn = await ensureLoggedIn(
      context,
      ref,
      message: context.l10n.scanSignInToSaveList,
    );
    if (!loggedIn || !mounted) return;

    final l10n = context.l10n;
    final titleController = TextEditingController(
      text: l10n.scanSaveListHint,
    );
    final title = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.scanSaveForNextPuja),
        content: TextField(
          controller: titleController,
          decoration: InputDecoration(labelText: l10n.scanSaveListTitle),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, titleController.text.trim()),
            child: Text(l10n.save),
          ),
        ],
      ),
    );
    if (title == null || title.isEmpty || !mounted) return;

    setState(() => _savingList = true);
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
      await ref.read(samagriScanApiProvider).saveList(
            title: title,
            rawText: _rawText.isNotEmpty ? _rawText : _textController.text.trim(),
            items: items,
          );
      await _loadSavedLists();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.scanListSaved)),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(friendlyNetworkError(e))),
      );
    } finally {
      if (mounted) setState(() => _savingList = false);
    }
  }

  Future<void> _deleteSavedList(String id) async {
    try {
      await ref.read(samagriScanApiProvider).deleteSavedList(id);
      await _loadSavedLists();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(friendlyNetworkError(e))),
      );
    }
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
    final bottom = MediaQuery.paddingOf(context).bottom;
    final hasResults = _matches.isNotEmpty || _rawText.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(
        title: l10n.scanPoojariListTitle,
        showBack: true,
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(20, 16, 20, 24 + bottom),
        children: [
          Text(
            l10n.scanPoojariListIntro,
            style: const TextStyle(
              color: AppColors.textMuted,
              height: 1.45,
              fontSize: 13.5,
            ),
          ),
          if (_savedLists.isNotEmpty) ...[
            const SizedBox(height: 18),
            Text(
              l10n.scanSavedLists,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14.5,
              ),
            ),
            const SizedBox(height: 10),
            ..._savedLists.map(
              (saved) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: PsCard(
                  child: Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: _loading
                              ? null
                              : () => _loadSavedList(saved['id'] as String),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                saved['title'] as String? ?? '',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '${saved['itemCount']} items',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      IconButton(
                        tooltip: l10n.scanDeleteSavedList,
                        onPressed: () =>
                            _deleteSavedList(saved['id'] as String),
                        icon: const Icon(Icons.delete_outline, size: 20),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ] else if (ref.watch(authControllerProvider).isAuthenticated) ...[
            const SizedBox(height: 12),
            Text(
              l10n.scanNoSavedLists,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 12.5),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loading
                      ? null
                      : () => _scanFromImage(ImageSource.camera),
                  icon: const Icon(Icons.photo_camera_outlined, size: 18),
                  label: Text(l10n.scanTakePhoto),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loading
                      ? null
                      : () => _scanFromImage(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_outlined, size: 18),
                  label: Text(l10n.scanChoosePhoto),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _textController,
            minLines: 4,
            maxLines: 8,
            decoration: InputDecoration(
              labelText: l10n.scanPasteListLabel,
              hintText: l10n.scanPasteListHint,
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _loading ? null : _scanFromText,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.maroon,
              minimumSize: const Size.fromHeight(46),
            ),
            icon: const Icon(Icons.search),
            label: Text(l10n.scanFindItems),
          ),
          if (_preview != null) ...[
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.file(
                _preview!,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
          ],
          if (_loading) ...[
            const SizedBox(height: 24),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 8),
            Center(
              child: Text(
                l10n.scanReadingList,
                style: const TextStyle(color: AppColors.textMuted),
              ),
            ),
          ],
          if (_error != null) ...[
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
          if (hasResults) ...[
            const SizedBox(height: 24),
            Text(
              l10n.scanExtractedText,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14.5,
              ),
            ),
            const SizedBox(height: 8),
            PsCard(
              child: Text(
                _rawText.trim().isNotEmpty
                    ? _rawText
                    : l10n.scanNoTextFound,
                style: const TextStyle(
                  fontSize: 12.5,
                  height: 1.45,
                  color: AppColors.textMuted,
                ),
              ),
            ),
            const SizedBox(height: 20),
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
                              const SizedBox(height: 3),
                              Text(
                                match['matchedText'] as String? ?? '',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textMuted,
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
                                    onPressed: qty <= 1
                                        ? null
                                        : () => _setQty(id, qty - 1),
                                    icon: const Icon(Icons.remove_circle_outline),
                                  ),
                                  Text('$qty'),
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    onPressed: qty >= 20
                                        ? null
                                        : () => _setQty(id, qty + 1),
                                    icon: const Icon(Icons.add_circle_outline),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Text(
                          formatInr(
                            (match['priceMinor'] as int? ?? 0) * qty,
                          ),
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            if (_unmatchedSuggestions.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                l10n.scanUnmatchedLines,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13.5,
                ),
              ),
              const SizedBox(height: 8),
              ..._unmatchedSuggestions.map((row) {
                final line = row['line'] as String? ?? '';
                final suggestions = (row['suggestions'] as List?)
                        ?.cast<Map<String, dynamic>>() ??
                    const [];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: PsCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '• $line',
                          style: const TextStyle(
                            fontSize: 12.5,
                            color: AppColors.textMuted,
                          ),
                        ),
                        if (suggestions.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(
                            l10n.scanDidYouMean,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: suggestions.map((s) {
                              final label = te &&
                                      (s['nameTe'] as String?)?.isNotEmpty ==
                                          true
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
            ] else if (_unmatched.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                l10n.scanUnmatchedLines,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13.5,
                ),
              ),
              const SizedBox(height: 6),
              ..._unmatched.map(
                (line) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Text(
                    '• $line',
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _savingList || _selected.isEmpty ? null : _saveList,
              icon: _savingList
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.bookmark_add_outlined),
              label: Text(l10n.scanSaveForNextPuja),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(
                    l10n.scanSelectedTotal(formatInr(_totalMinor)),
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14.5,
                    ),
                  ),
                ),
                FilledButton(
                  onPressed: _adding || _selected.isEmpty
                      ? null
                      : _addSelectedToCart,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.maroon,
                  ),
                  child: Text(
                    _adding ? l10n.addingToCart : l10n.scanAddToCart,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
