import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_theme.dart';

class PsHeader extends StatelessWidget implements PreferredSizeWidget {
  const PsHeader({
    super.key,
    required this.title,
    this.actions,
    this.showBack = true,
  });

  final String title;
  final List<Widget>? actions;
  final bool showBack;

  @override
  Size get preferredSize => const Size.fromHeight(58);

  @override
  Widget build(BuildContext context) {
    final canPop = Navigator.of(context).canPop();
    return Material(
      color: AppColors.headerBar,
      child: Container(
        height: 58,
        padding: const EdgeInsets.symmetric(horizontal: 18),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppColors.divider)),
        ),
        child: Row(
          children: [
            if (showBack && canPop)
              GestureDetector(
                onTap: () => context.pop(),
                child: const Padding(
                  padding: EdgeInsets.only(right: 14),
                  child: Text(
                    '←',
                    style: TextStyle(
                      fontSize: 20,
                      color: AppColors.maroonDeep,
                      height: 1,
                    ),
                  ),
                ),
              ),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 18.5,
                  color: AppColors.text,
                ),
              ),
            ),
            ...?actions,
          ],
        ),
      ),
    );
  }
}

class PsCard extends StatelessWidget {
  const PsCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(14),
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    final body = Padding(padding: padding, child: child);
    return Material(
      color: t.surface,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: t.border),
      ),
      child: onTap == null
          ? body
          : InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(18),
              child: body,
            ),
    );
  }
}

class StripeBlock extends StatelessWidget {
  const StripeBlock({
    super.key,
    required this.index,
    this.height = 110,
    this.borderRadius,
  });

  final int index;
  final double height;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    final child = CustomPaint(
      painter: _StripePainter(t.stripe(index), t.cream),
      child: SizedBox(height: height, width: double.infinity),
    );
    if (borderRadius == null) return child;
    return ClipRRect(borderRadius: borderRadius!, child: child);
  }
}

class _StripePainter extends CustomPainter {
  _StripePainter(this.stripe, this.cream);

  final Color stripe;
  final Color cream;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Offset.zero & size, Paint()..color = cream);
    final paint = Paint()..color = stripe;
    const band = 14.0;
    const period = 28.0;
    for (double x = -size.height; x < size.width + size.height; x += period) {
      final path = Path()
        ..moveTo(x, 0)
        ..lineTo(x + band, 0)
        ..lineTo(x + band + size.height, size.height)
        ..lineTo(x + size.height, size.height)
        ..close();
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _StripePainter oldDelegate) =>
      oldDelegate.stripe != stripe || oldDelegate.cream != cream;
}

class PsChoiceChip extends StatelessWidget {
  const PsChoiceChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  final String label;
  final bool selected;
  final VoidCallback onSelected;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onSelected(),
        selectedColor: context.ps.maroon,
        labelStyle: TextStyle(
          color: selected ? Colors.white : context.ps.text,
          fontWeight: FontWeight.w600,
          fontSize: 13,
        ),
        backgroundColor: context.ps.surface,
        side: BorderSide(
          color: selected ? context.ps.maroon : context.ps.border,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }
}

class PsOptionCard extends StatelessWidget {
  const PsOptionCard({
    super.key,
    required this.title,
    this.subtitle,
    required this.selected,
    required this.onTap,
    this.trailing,
  });

  final String title;
  final String? subtitle;
  final bool selected;
  final VoidCallback onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    return Material(
      color: t.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: selected ? t.maroon : t.border,
          width: selected ? 1.5 : 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: selected ? t.maroon : t.textMuted,
                    width: 2,
                  ),
                ),
                child: selected
                    ? Center(
                        child: Container(
                          width: 9,
                          height: 9,
                          decoration: BoxDecoration(
                            color: t.maroon,
                            shape: BoxShape.circle,
                          ),
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: t.text,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 3),
                      Text(
                        subtitle!,
                        style: TextStyle(
                          fontSize: 12.5,
                          color: t.textMuted,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              ?trailing,
            ],
          ),
        ),
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({
    super.key,
    required this.title,
    this.action,
    this.onAction,
  });

  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 12, 12),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 16,
                color: context.ps.text,
              ),
            ),
          ),
          if (action != null)
            TextButton(
              onPressed: onAction,
              child: Text(
                action!,
                style: TextStyle(
                  color: context.ps.saffron,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class PsSaffronButton extends StatelessWidget {
  const PsSaffronButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: t.saffron.withValues(alpha: 0.55),
            blurRadius: 24,
            offset: const Offset(0, 10),
            spreadRadius: -8,
          ),
        ],
      ),
      child: FilledButton(
        onPressed: loading ? null : onPressed,
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: loading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Text(label),
      ),
    );
  }
}

class PsQtyStepper extends StatelessWidget {
  const PsQtyStepper({
    super.key,
    required this.qty,
    required this.onDec,
    required this.onInc,
  });

  final int qty;
  final VoidCallback onDec;
  final VoidCallback onInc;

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: t.bg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: onDec,
            child: Text('−', style: TextStyle(fontSize: 15, color: t.text)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text(
              '$qty',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: t.text,
              ),
            ),
          ),
          GestureDetector(
            onTap: onInc,
            child: Text('+', style: TextStyle(fontSize: 15, color: t.text)),
          ),
        ],
      ),
    );
  }
}

class PsDarkSwitch extends StatelessWidget {
  const PsDarkSwitch({super.key, required this.value, required this.onTap});

  final bool value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 46,
        height: 26,
        padding: const EdgeInsets.all(3),
        alignment: value ? Alignment.centerRight : Alignment.centerLeft,
        decoration: BoxDecoration(
          color: value ? t.saffron : t.border,
          borderRadius: BorderRadius.circular(13),
        ),
        child: Container(
          width: 20,
          height: 20,
          decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}

class OnboardPetals extends StatelessWidget {
  const OnboardPetals({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    final palette = [t.saffron, t.gold, t.maroon];
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(7, (i) {
        return CustomPaint(
          size: const Size(14, 12),
          painter: _DownPetalPainter(palette[i % 3]),
        );
      }),
    );
  }
}

class _DownPetalPainter extends CustomPainter {
  _DownPetalPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width / 2, size.height)
      ..close();
    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(covariant _DownPetalPainter oldDelegate) =>
      oldDelegate.color != color;
}

