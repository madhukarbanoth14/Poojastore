import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class DiyaMark extends StatelessWidget {
  const DiyaMark({
    super.key,
    this.size = 56,
    this.background = AppColors.maroon,
    this.flame = AppColors.gold,
  });

  final double size;
  final Color background;
  final Color flame;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(size * 0.28),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.28),
            blurRadius: 22,
          ),
        ],
      ),
      child: Center(
        child: Transform.rotate(
          angle: 3.14159,
          child: Container(
            width: size * 0.28,
            height: size * 0.42,
            decoration: BoxDecoration(
              color: flame,
              borderRadius: BorderRadius.circular(size),
            ),
          ),
        ),
      ),
    );
  }
}

class DiyaOrb extends StatelessWidget {
  const DiyaOrb({super.key, this.size = 104});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const RadialGradient(
          center: Alignment(-0.3, -0.4),
          colors: [AppColors.goldBright, AppColors.gold],
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.goldBright.withValues(alpha: 0.5),
            blurRadius: 40,
          ),
        ],
      ),
      child: Center(
        child: Transform.rotate(
          angle: 3.14159,
          child: Container(
            width: size * 0.25,
            height: size * 0.36,
            decoration: BoxDecoration(
              color: AppColors.maroon,
              borderRadius: BorderRadius.circular(size),
            ),
          ),
        ),
      ),
    );
  }
}

class GarlandDots extends StatelessWidget {
  const GarlandDots({super.key, this.count = 10, this.alignStart = false});

  final int count;
  final bool alignStart;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment:
          alignStart ? MainAxisAlignment.start : MainAxisAlignment.center,
      children: List.generate(
        count,
        (i) => Padding(
          padding: const EdgeInsets.only(right: 4),
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: i.isEven ? AppColors.goldBright : AppColors.orange,
            ),
          ),
        ),
      ),
    );
  }
}

class TwinkleDot extends StatefulWidget {
  const TwinkleDot({
    super.key,
    required this.size,
    required this.color,
    this.delay = Duration.zero,
  });

  final double size;
  final Color color;
  final Duration delay;

  @override
  State<TwinkleDot> createState() => _TwinkleDotState();
}

class _TwinkleDotState extends State<TwinkleDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );
    Future<void>.delayed(widget.delay, () {
      if (mounted) _c.repeat(reverse: true);
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (context, _) {
        final t = 0.25 + (_c.value * 0.75);
        return Transform.scale(
          scale: 0.7 + (_c.value * 0.45),
          child: Opacity(
            opacity: t,
            child: Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                color: widget.color,
                shape: BoxShape.circle,
              ),
            ),
          ),
        );
      },
    );
  }
}
