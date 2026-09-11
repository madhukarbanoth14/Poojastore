import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_widgets.dart';

class PriestsListScreen extends StatelessWidget {
  const PriestsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(
        title: 'Book a Priest',
        showBack: context.canPop(),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 28, 20, 40),
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(22, 28, 22, 26),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Text(
                  'COMING SOON',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.8,
                    color: AppColors.maroon,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Poojari booking is on its way',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 22,
                    height: 1.25,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'We are preparing verified poojaris for home visits and online consultations. Shop a kit today — booking opens shortly.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.5,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 22),
                FilledButton(
                  onPressed: () => context.go('/shop'),
                  child: const Text('Shop pooja kits'),
                ),
                const SizedBox(height: 14),
                TextButton(
                  onPressed: () => context.push('/poojari/apply'),
                  child: const Text('Are you a pujari? Join the directory'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
