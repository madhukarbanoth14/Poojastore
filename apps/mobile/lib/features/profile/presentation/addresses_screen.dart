import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../marketplace/presentation/kits_screen.dart';

class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.ps;
    return Scaffold(
      backgroundColor: t.bg,
      appBar: const PsHeader(title: 'Saved Addresses'),
      body: FutureBuilder(
        future: ref.read(marketplaceApiProvider).listAddresses(),
        builder: (context, snapshot) {
          final items = snapshot.data ?? const <Map<String, dynamic>>[];
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (items.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(30),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'No saved addresses yet',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                        color: t.text,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Add one at checkout. We currently deliver in Hyderabad (PIN 500xxx).',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: t.textMuted),
                    ),
                  ],
                ),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, i) {
              final a = items[i];
              return PsCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      a['label'] as String,
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: t.text,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${a['line1']}, ${a['city']}, ${a['state']} ${a['postalCode']}',
                      style: TextStyle(fontSize: 12.5, color: t.textMuted),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
