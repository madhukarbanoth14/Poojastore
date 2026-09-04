import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/pooja_guides_catalog.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../l10n/l10n.dart';

class PoojaGuideDetailScreen extends StatelessWidget {
  const PoojaGuideDetailScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context) {
    final g = poojaGuideById(id);
    final l10n = context.l10n;
    final te = context.isTelugu;
    final note = g.note(te);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(title: Text(g.title(te))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        children: [
          Text(
            l10n.pairWithBasicHint,
            style: const TextStyle(fontSize: 13.5, height: 1.5, color: AppColors.textMuted),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: () => context.push('/kits/$basicKitSlug'),
            child: Text(l10n.pairWithBasicKit),
          ),
          if (g.deityKitSlug != null) ...[
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () => context.push('/kits/${g.deityKitSlug}'),
              child: Text(l10n.deitySpecificKit),
            ),
          ],
          if (g.kitSlug != null && g.kitSlug != g.deityKitSlug) ...[
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () => context.push('/kits/${g.kitSlug}'),
              child: Text(l10n.festivalVrathamKit),
            ),
          ],
          const SizedBox(height: 22),
          PpTitle(l10n.specialForThisPooja, size: 15),
          const SizedBox(height: 10),
          ...g.special.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('•  ', style: TextStyle(color: AppColors.saffron, fontSize: 16)),
                  Expanded(
                    child: Text(
                      item.label(te),
                      style: const TextStyle(fontSize: 14, height: 1.45, color: AppColors.text),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          PpTitle(l10n.commonSamagriTitle, size: 15),
          const SizedBox(height: 8),
          Text(
            l10n.commonItemsAlsoNeeded,
            style: const TextStyle(fontSize: 13, height: 1.5, color: AppColors.textMuted),
          ),
          const SizedBox(height: 10),
          TextButton(
            onPressed: () => context.push('/poojas'),
            child: Text(l10n.viewCommonSamagri),
          ),
          if (note != null) ...[
            const SizedBox(height: 16),
            Text(note, style: const TextStyle(fontSize: 13, height: 1.5, color: AppColors.body)),
          ],
          const SizedBox(height: 16),
          Text(
            l10n.poojaGuideDisclaimer,
            style: const TextStyle(fontSize: 12.5, height: 1.5, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}
