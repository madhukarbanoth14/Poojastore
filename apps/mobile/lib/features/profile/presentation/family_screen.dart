import 'package:flutter/material.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/catalog/design_catalog.dart';
import '../../../core/catalog/prototype_catalog_i18n.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';

class FamilyMembersScreen extends StatelessWidget {
  const FamilyMembersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    final l10n = context.l10n;
    final te = context.isTelugu;

    return Scaffold(
      backgroundColor: t.bg,
      appBar: PsHeader(title: l10n.familyMembers),
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
        itemCount: familyMembers.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, i) {
          final f = familyMembers[i];
          final relation = localizedFamilyRelation(i, f.relation, te);
          final nakshatram = localizedFamilyNakshatram(i, f.nakshatram, te);
          return PsCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(
                    text: f.name,
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: t.text,
                    ),
                    children: [
                      TextSpan(
                        text: ' · $relation',
                        style: TextStyle(
                          fontWeight: FontWeight.w400,
                          fontSize: 12,
                          color: t.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  l10n.gotramNakshatramLine(f.gotram, nakshatram),
                  style: TextStyle(fontSize: 12.5, color: t.textMuted),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
