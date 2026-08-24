import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_widgets.dart';

class ArchanaHubScreen extends StatelessWidget {
  const ArchanaHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const PsHeader(title: 'Online Archana'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
        children: [
          const MaroonGradient(
            padding: EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Archana from a real temple',
                  style: TextStyle(
                    color: AppColors.cream,
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Busy on your special day? Book a temple pujari for a live video archana — performed at the shrine in your name while you join from home.',
                  style: TextStyle(
                    color: AppColors.cream,
                    height: 1.45,
                    fontSize: 13.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const _StepTile(
            number: '1',
            title: 'Choose your deity',
            body: 'Pick your ishta devata — or select “Any deity” if you are flexible.',
          ),
          const _StepTile(
            number: '2',
            title: 'Select a temple pujari',
            body: 'Browse verified pujaris serving at temples near you.',
          ),
          const _StepTile(
            number: '3',
            title: 'Schedule & join the call',
            body: 'Pay, then join the video call at your slot while archana is performed live.',
          ),
          const SizedBox(height: 24),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          child: TerracottaButton(
            label: 'Choose deity & book',
            onPressed: () => context.push('/archana/deity'),
          ),
        ),
      ),
    );
  }
}

class _StepTile extends StatelessWidget {
  const _StepTile({
    required this.number,
    required this.title,
    required this.body,
  });

  final String number;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.chipBg,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(
              number,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                color: AppColors.saffron,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14.5,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  body,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    height: 1.4,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
