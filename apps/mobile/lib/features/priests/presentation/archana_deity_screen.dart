import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/archana_catalog.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_widgets.dart';

class ArchanaDeityScreen extends StatelessWidget {
  const ArchanaDeityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const PsHeader(title: 'Choose your deity'),
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        itemCount: archanaDeities.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final deity = archanaDeities[index];
          return PsCard(
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => context.push('/archana/priests?deity=${deity.slug}'),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            deity.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              color: AppColors.text,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            deity.description,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              height: 1.4,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right,
                      color: AppColors.saffron,
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
