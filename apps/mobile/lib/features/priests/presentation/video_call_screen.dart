import 'dart:async';

import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../data/priests_api.dart';

class VideoCallScreen extends ConsumerStatefulWidget {
  const VideoCallScreen({
    super.key,
    required this.bookingId,
    this.peerName,
  });

  final String bookingId;
  final String? peerName;

  @override
  ConsumerState<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends ConsumerState<VideoCallScreen> {
  RtcEngine? _engine;
  int? _remoteUid;
  bool _joined = false;
  bool _muted = false;
  bool _videoOff = false;
  bool _loading = true;
  String? _error;
  String _peerName = 'Panditji';
  bool _audioOnly = false;
  int _seconds = 0;
  Timer? _timer;
  String? _channelName;

  @override
  void initState() {
    super.initState();
    _peerName = widget.peerName ?? 'Panditji';
    _startCall();
  }

  Future<void> _startCall() async {
    try {
      final join = await ref.read(priestsApiProvider).joinBooking(widget.bookingId);
      final agora = join['agora'] as Map<String, dynamic>?;
      if (agora == null) {
        throw StateError('Agora credentials were not returned for this booking');
      }

      _audioOnly = (join['consultationMedia'] as String?) == 'AUDIO';
      _peerName = (join['peerName'] as String?) ?? _peerName;
      _channelName = agora['channelName'] as String;

      final permissions = <Permission>[Permission.microphone];
      if (!_audioOnly) permissions.add(Permission.camera);
      for (final permission in permissions) {
        final status = await permission.request();
        if (!status.isGranted) {
          throw StateError('Microphone/camera permission is required for consultations');
        }
      }

      final engine = createAgoraRtcEngine();
      await engine.initialize(
        RtcEngineContext(appId: agora['appId'] as String),
      );
      engine.registerEventHandler(
        RtcEngineEventHandler(
          onJoinChannelSuccess: (_, __) {
            if (mounted) setState(() => _joined = true);
          },
          onUserJoined: (_, remoteUid, __) {
            if (mounted) setState(() => _remoteUid = remoteUid);
          },
          onUserOffline: (_, remoteUid, __) {
            if (mounted && _remoteUid == remoteUid) {
              setState(() => _remoteUid = null);
            }
          },
        ),
      );

      await engine.enableAudio();
      if (_audioOnly) {
        await engine.disableVideo();
        _videoOff = true;
      } else {
        await engine.enableVideo();
        await engine.startPreview();
      }

      await engine.joinChannel(
        token: agora['token'] as String,
        channelId: agora['channelName'] as String,
        uid: agora['uid'] as int,
        options: const ChannelMediaOptions(
          channelProfile: ChannelProfileType.channelProfileCommunication,
          clientRoleType: ClientRoleType.clientRoleBroadcaster,
        ),
      );

      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (mounted) setState(() => _seconds++);
      });

      if (mounted) {
        setState(() {
          _engine = engine;
          _loading = false;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _error = '$error';
          _loading = false;
        });
      }
    }
  }

  Future<void> _leaveCall() async {
    _timer?.cancel();
    final engine = _engine;
    _engine = null;
    if (engine != null) {
      await engine.leaveChannel();
      await engine.release();
    }
    if (mounted) context.pop();
  }

  Future<void> _toggleMute() async {
    final engine = _engine;
    if (engine == null) return;
    final next = !_muted;
    await engine.muteLocalAudioStream(next);
    setState(() => _muted = next);
  }

  Future<void> _toggleVideo() async {
    if (_audioOnly) return;
    final engine = _engine;
    if (engine == null) return;
    final next = !_videoOff;
    await engine.muteLocalVideoStream(next);
    setState(() => _videoOff = next);
  }

  String get _duration {
    final mm = (_seconds ~/ 60).toString().padLeft(2, '0');
    final ss = (_seconds % 60).toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  @override
  void dispose() {
    _timer?.cancel();
    final engine = _engine;
    _engine = null;
    if (engine != null) {
      engine.leaveChannel();
      engine.release();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: Color(0xFF12100F),
        body: Center(child: CircularProgressIndicator(color: AppColors.saffron)),
      );
    }
    if (_error != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF12100F),
        appBar: AppBar(backgroundColor: Colors.transparent),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(_error!, style: const TextStyle(color: Colors.white)),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF12100F),
      body: Stack(
        children: [
          if (!_audioOnly && _remoteUid != null && _engine != null)
            AgoraVideoView(
              controller: VideoViewController.remote(
                rtcEngine: _engine!,
                canvas: VideoCanvas(uid: _remoteUid),
                connection: RtcConnection(channelId: _channelName!),
              ),
            )
          else
            Center(
              child: CircleAvatar(
                radius: 60,
                backgroundColor: AppColors.avatar(_peerName.hashCode),
                child: Text(
                  initialsFrom(_peerName),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 36,
                  ),
                ),
              ),
            ),
          if (!_audioOnly && _engine != null && !_videoOff)
            Positioned(
              top: 90,
              right: 20,
              child: SizedBox(
                width: 96,
                height: 128,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: AgoraVideoView(
                    controller: VideoViewController(
                      rtcEngine: _engine!,
                      canvas: const VideoCanvas(uid: 0),
                    ),
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _peerName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        _audioOnly ? 'Audio consultation' : 'Video consultation',
                        style: const TextStyle(
                          color: Color(0xB3FFFFFF),
                          fontSize: 12,
                        ),
                      ),
                    ],
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
                    onTap: _toggleMute,
                  ),
                  if (!_audioOnly) ...[
                    const SizedBox(width: 16),
                    _CallBtn(
                      label: _videoOff ? 'Cam On' : 'Cam Off',
                      bg: _videoOff ? Colors.white : const Color(0x26FFFFFF),
                      fg: _videoOff ? const Color(0xFF12100F) : Colors.white,
                      onTap: _toggleVideo,
                    ),
                  ],
                  const SizedBox(width: 16),
                  _CallBtn(
                    label: 'End',
                    bg: const Color(0xFFD64545),
                    fg: Colors.white,
                    onTap: _leaveCall,
                  ),
                ],
              ),
            ),
          ),
          if (!_joined)
            const Positioned.fill(
              child: ColoredBox(
                color: Color(0x88000000),
                child: Center(
                  child: Text(
                    'Connecting…',
                    style: TextStyle(color: Colors.white),
                  ),
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
