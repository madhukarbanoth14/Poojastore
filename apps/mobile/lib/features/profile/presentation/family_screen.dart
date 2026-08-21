import 'package:flutter/material.dart';
import '../../../core/catalog/design_catalog.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_widgets.dart';

class FamilyMembersScreen extends StatelessWidget {
  const FamilyMembersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    return Scaffold(
      backgroundColor: t.bg,
      appBar: const PsHeader(title: 'Family Members'),
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
        itemCount: familyMembers.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, i) {
          final f = familyMembers[i];
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
                        text: ' · ${f.relation}',
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
                  'Gotram: ${f.gotram} · Nakshatram: ${f.nakshatram}',
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
