import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/pooja_guides_catalog.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';

class PoojaGuidesScreen extends StatelessWidget {
  const PoojaGuidesScreen({super.key, this.kind});

  final String? kind;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final te = context.isTelugu;
    return DefaultTabController(
      length: 4,
      initialIndex: switch (kind) {
        'deity' => 1,
        'festival' => 2,
        'vratham' => 3,
        _ => 0,
      },
      child: Scaffold(
        backgroundColor: AppColors.bg,
        appBar: AppBar(
          title: Text(l10n.poojaGuidesTitle),
          bottom: TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: l10n.commonSamagriTitle),
              Tab(text: l10n.deityPoojaTitle),
              Tab(text: l10n.festivalPoojaTitle),
              Tab(text: l10n.vrathamPoojaTitle),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _CommonTab(te: te, l10n: l10n),
            _GuideList(kind: PoojaKind.deity, te: te),
            _GuideList(kind: PoojaKind.festival, te: te),
            _GuideList(kind: PoojaKind.vratham, te: te),
          ],
        ),
      ),
    );
  }
}

class _CommonTab extends StatelessWidget {
  const _CommonTab({required this.te, required this.l10n});

  final bool te;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        Text(
          l10n.poojaGuidesSubtitle,
          style: const TextStyle(fontSize: 13.5, height: 1.5, color: AppColors.textMuted),
        ),
        const SizedBox(height: 14),
        FilledButton(
          onPressed: () => context.push('/kits/$basicKitSlug'),
          child: Text(l10n.pairWithBasicKit),
        ),
        const SizedBox(height: 18),
        for (final group in commonSamagriGroups) ...[
          PpTitle(group.title(te), size: 14.5),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: group.items
                .map(
                  (item) => Chip(
                    label: Text(item.label(te)),
                    backgroundColor: AppColors.chipBg,
                    side: BorderSide.none,
                    labelStyle: const TextStyle(
                      fontSize: 12.5,
                      color: AppColors.maroonDeep,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 18),
        ],
        Text(
          l10n.poojaGuideDisclaimer,
          style: const TextStyle(fontSize: 12.5, height: 1.5, color: AppColors.textMuted),
        ),
      ],
    );
  }
}

class _GuideList extends StatelessWidget {
  const _GuideList({required this.kind, required this.te});

  final PoojaKind kind;
  final bool te;

  @override
  Widget build(BuildContext context) {
    final guides = guidesByKind(kind);
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      itemCount: guides.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, i) {
        final g = guides[i];
        return PsCard(
          onTap: () => context.push('/poojas/${g.id}'),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  g.title(te),
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5),
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.maroonDeep),
            ],
          ),
        );
      },
    );
  }
}
