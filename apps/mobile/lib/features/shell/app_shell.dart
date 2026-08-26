import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(
          color: t.surface,
          border: Border(top: BorderSide(color: t.border)),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(6, 10, 6, 14),
            child: Row(
              children: [
                _NavItem(
                  label: 'Home',
                  selected: navigationShell.currentIndex == 0,
                  onTap: () => _go(0),
                  icon: _NavIcon.home,
                ),
                _NavItem(
                  label: 'Samagri',
                  selected: navigationShell.currentIndex == 1,
                  onTap: () => _go(1),
                  icon: _NavIcon.categories,
                ),
                _NavItem(
                  label: 'Poojaris',
                  selected: navigationShell.currentIndex == 2,
                  onTap: () => _go(2),
                  icon: _NavIcon.priests,
                ),
                _NavItem(
                  label: 'Account',
                  selected: navigationShell.currentIndex == 3,
                  onTap: () => _go(3),
                  icon: _NavIcon.profile,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _go(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }
}

enum _NavIcon { home, categories, priests, profile }

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final _NavIcon icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? context.ps.saffron : context.ps.textMuted;
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 20,
                height: 20,
                child: CustomPaint(painter: _NavIconPainter(icon, color)),
              ),
              const SizedBox(height: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavIconPainter extends CustomPainter {
  _NavIconPainter(this.kind, this.color);

  final _NavIcon kind;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    switch (kind) {
      case _NavIcon.home:
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Offset.zero & size,
            const Radius.circular(6),
          ),
          paint,
        );
      case _NavIcon.categories:
        const gap = 3.0;
        final cell = (size.width - gap) / 2;
        for (var r = 0; r < 2; r++) {
          for (var c = 0; c < 2; c++) {
            canvas.drawRect(
              Rect.fromLTWH(c * (cell + gap), r * (cell + gap), cell, cell),
              paint,
            );
          }
        }
      case _NavIcon.priests:
        canvas.drawCircle(
          Offset(size.width / 2, size.height / 2),
          size.width / 2 - 1.25,
          Paint()
            ..color = color
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.5,
        );
      case _NavIcon.profile:
        canvas.drawCircle(
          Offset(size.width / 2, size.height / 2),
          size.width / 2,
          paint,
        );
    }
  }

  @override
  bool shouldRepaint(covariant _NavIconPainter oldDelegate) =>
      oldDelegate.kind != kind || oldDelegate.color != color;
}
