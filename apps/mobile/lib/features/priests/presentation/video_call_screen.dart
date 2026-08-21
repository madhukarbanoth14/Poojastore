import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';

class VideoCallScreen extends StatefulWidget {
  const VideoCallScreen({
    super.key,
    required this.slug,
    required this.name,
  });

  final String slug;
  final String name;

  @override
  State<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends State<VideoCallScreen> {
  int _seconds = 0;
  bool _muted = false;
  bool _videoOff = false;
  bool _chatOpen = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _seconds++);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _duration {
    final mm = (_seconds ~/ 60).toString().padLeft(2, '0');
    final ss = (_seconds % 60).toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF12100F),
      body: Stack(
        children: [
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF241A16), Color(0xFF0E0B0A)],
              ),
            ),
            child: SizedBox.expand(),
          ),
          Center(
            child: CircleAvatar(
              radius: 60,
              backgroundColor: AppColors.avatar(widget.name.hashCode),
              child: Text(
                initialsFrom(widget.name),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 36,
                ),
              ),
            ),
          ),
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    widget.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                ),
                Text(
                  _duration,
                  style: const TextStyle(
                    color: Color(0xB3FFFFFF),
                    fontSize: 12.5,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            top: 90,
            right: 20,
            child: Container(
              width: 78,
              height: 110,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: const Color(0xFF3A2A22),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0x33FFFFFF), width: 2),
              ),
              child: const Text(
                'YOU',
                style: TextStyle(
                  color: Color(0x80FFFFFF),
                  fontSize: 10,
                  fontFamily: 'monospace',
                ),
              ),
            ),
          ),
          if (_chatOpen)
            Positioned(
              left: 16,
              right: 16,
              top: 230,
              bottom: 150,
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xD9140F0D),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        constraints: const BoxConstraints(maxWidth: 260),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 9,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0x1FFFFFFF),
                          borderRadius: BorderRadius.circular(11),
                        ),
                        child: const Text(
                          'Namaste! Please keep the Panchamrit ready before we begin.',
                          style: TextStyle(color: Colors.white, fontSize: 12.5),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerRight,
                      child: Container(
                        constraints: const BoxConstraints(maxWidth: 260),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 9,
                        ),
                        decoration: BoxDecoration(
                          color: context.ps.saffron,
                          borderRadius: BorderRadius.circular(11),
                        ),
                        child: const Text(
                          "Sure, it's ready. Thank you Panditji.",
                          style: TextStyle(color: Colors.white, fontSize: 12.5),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 22, 24, 34),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _CallBtn(
                    label: _muted ? 'Unmute' : 'Mute',
                    bg: _muted ? Colors.white : const Color(0x26FFFFFF),
                    fg: _muted ? const Color(0xFF12100F) : Colors.white,
                    onTap: () => setState(() => _muted = !_muted),
                  ),
                  const SizedBox(width: 16),
                  _CallBtn(
                    label: _videoOff ? 'Cam On' : 'Cam Off',
                    bg: _videoOff ? Colors.white : const Color(0x26FFFFFF),
                    fg: _videoOff ? const Color(0xFF12100F) : Colors.white,
                    onTap: () => setState(() => _videoOff = !_videoOff),
                  ),
                  const SizedBox(width: 16),
                  _CallBtn(
                    label: 'Chat',
                    bg: const Color(0x26FFFFFF),
                    fg: Colors.white,
                    onTap: () => setState(() => _chatOpen = !_chatOpen),
                  ),
                  const SizedBox(width: 16),
                  _CallBtn(
                    label: 'End',
                    bg: const Color(0xFFD64545),
                    fg: Colors.white,
                    onTap: () => context.pop(),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CallBtn extends StatelessWidget {
  const _CallBtn({
    required this.label,
    required this.bg,
    required this.fg,
    required this.onTap,
  });

  final String label;
  final Color bg;
  final Color fg;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 56,
        height: 56,
        alignment: Alignment.center,
        decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
        child: Text(
          label,
          style: TextStyle(
            color: fg,
            fontSize: 11.5,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
