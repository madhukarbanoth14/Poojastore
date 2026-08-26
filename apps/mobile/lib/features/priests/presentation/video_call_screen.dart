import 'dart:async';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/config/app_config.dart';
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
  RtcEngine? _engine;
  int _seconds = 0;
  bool _muted = false;
  bool _videoOff = false;
  bool _joining = true;
  bool _localJoined = false;
  int? _remoteUid;
  String? _error;
  Timer? _timer;

  late final String _channelId;

  @override
  void initState() {
    super.initState();
    _channelId = _sanitizeChannel(widget.slug);
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_localJoined && mounted) setState(() => _seconds++);
    });
    _initAgora();
  }

  String _sanitizeChannel(String slug) {
    final cleaned = slug
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9_-]'), '-')
        .replaceAll(RegExp(r'-+'), '-')
        .replaceAll(RegExp(r'^-|-$'), '');
    final base = cleaned.isEmpty ? 'poojari' : cleaned;
    // Agora channel name max 64 bytes.
    final id = 'ps-$base';
    return id.length > 64 ? id.substring(0, 64) : id;
  }

  Future<void> _initAgora() async {
    if (AppConfig.agoraAppId.isEmpty) {
      setState(() {
        _joining = false;
        _error =
            'Agora App ID is missing. Rebuild with --dart-define=AGORA_APP_ID=…';
      });
      return;
    }

    final cam = await Permission.camera.request();
    final mic = await Permission.microphone.request();
    if (!cam.isGranted || !mic.isGranted) {
      if (!mounted) return;
      setState(() {
        _joining = false;
        _error =
            'Camera and microphone permission are required for video calls.';
      });
      return;
    }

    try {
      final engine = createAgoraRtcEngine();
      await engine.initialize(
        RtcEngineContext(
          appId: AppConfig.agoraAppId,
          channelProfile: ChannelProfileType.channelProfileCommunication,
        ),
      );

      engine.registerEventHandler(
        RtcEngineEventHandler(
          onJoinChannelSuccess: (connection, elapsed) {
            if (!mounted) return;
            setState(() {
              _localJoined = true;
              _joining = false;
              _error = null;
            });
          },
          onUserJoined: (connection, remoteUid, elapsed) {
            if (!mounted) return;
            setState(() => _remoteUid = remoteUid);
          },
          onUserOffline: (connection, remoteUid, reason) {
            if (!mounted) return;
            if (_remoteUid == remoteUid) {
              setState(() => _remoteUid = null);
            }
          },
          onError: (err, msg) {
            if (!mounted) return;
            setState(() {
              _joining = false;
              _error = 'Call error ($err): $msg';
            });
          },
          onConnectionStateChanged: (connection, state, reason) {
            if (!mounted) return;
            if (state == ConnectionStateType.connectionStateFailed) {
              setState(() {
                _joining = false;
                _error =
                    'Could not join call ($reason). If your Agora project uses a certificate, generate a temporary token in Agora Console or add a token server.';
              });
            }
          },
        ),
      );

      await engine.enableVideo();
      await engine.enableAudio();
      await engine.startPreview();

      // Empty token works only when the Agora project is in App ID-only
      // (testing) mode. Production needs a server-minted RTC token.
      await engine.joinChannel(
        token: AppConfig.agoraToken,
        channelId: _channelId,
        uid: 0,
        options: const ChannelMediaOptions(
          channelProfile: ChannelProfileType.channelProfileCommunication,
          clientRoleType: ClientRoleType.clientRoleBroadcaster,
          publishCameraTrack: true,
          publishMicrophoneTrack: true,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
        ),
      );

      if (!mounted) return;
      setState(() => _engine = engine);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _joining = false;
        _error = 'Failed to start call: $e';
      });
    }
  }

  Future<void> _toggleMute() async {
    final next = !_muted;
    await _engine?.muteLocalAudioStream(next);
    if (mounted) setState(() => _muted = next);
  }

  Future<void> _toggleVideo() async {
    final next = !_videoOff;
    await _engine?.muteLocalVideoStream(next);
    if (mounted) setState(() => _videoOff = next);
  }

  Future<void> _endCall() async {
    try {
      await _engine?.leaveChannel();
      await _engine?.release();
    } catch (_) {}
    _engine = null;
    if (mounted) context.pop();
  }

  @override
  void dispose() {
    _timer?.cancel();
    final engine = _engine;
    _engine = null;
    if (engine != null) {
      unawaited(() async {
        try {
          await engine.leaveChannel();
          await engine.release();
        } catch (_) {}
      }());
    }
    super.dispose();
  }

  String get _duration {
    final mm = (_seconds ~/ 60).toString().padLeft(2, '0');
    final ss = (_seconds % 60).toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  @override
  Widget build(BuildContext context) {
    final engine = _engine;

    return Scaffold(
      backgroundColor: const Color(0xFF12100F),
      body: Stack(
        children: [
          Positioned.fill(
            child: engine == null || _remoteUid == null
                ? DecoratedBox(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF241A16), Color(0xFF0E0B0A)],
                      ),
                    ),
                    child: Center(
                      child: _joining
                          ? const Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                CircularProgressIndicator(
                                  color: AppColors.goldBright,
                                ),
                                SizedBox(height: 16),
                                Text(
                                  'Connecting…',
                                  style: TextStyle(color: Colors.white70),
                                ),
                              ],
                            )
                          : Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                CircleAvatar(
                                  radius: 60,
                                  backgroundColor:
                                      AppColors.avatar(widget.name.hashCode),
                                  child: Text(
                                    initialsFrom(widget.name),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 36,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  _remoteUid == null && _localJoined
                                      ? 'Waiting for ${widget.name}…'
                                      : widget.name,
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  )
                : AgoraVideoView(
                    controller: VideoViewController.remote(
                      rtcEngine: engine,
                      canvas: VideoCanvas(uid: _remoteUid),
                      connection: RtcConnection(channelId: _channelId),
                    ),
                  ),
          ),
          if (engine != null && !_videoOff)
            Positioned(
              top: 90,
              right: 20,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: SizedBox(
                  width: 100,
                  height: 140,
                  child: AgoraVideoView(
                    controller: VideoViewController(
                      rtcEngine: engine,
                      canvas: const VideoCanvas(uid: 0),
                      useFlutterTexture: false,
                    ),
                  ),
                ),
              ),
            )
          else
            Positioned(
              top: 90,
              right: 20,
              child: Container(
                width: 100,
                height: 140,
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
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: _endCall,
                      icon: const Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
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
                      _localJoined ? _duration : '—:—',
                      style: const TextStyle(
                        color: Color(0xB3FFFFFF),
                        fontSize: 12.5,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_error != null)
            Positioned(
              left: 20,
              right: 20,
              bottom: 120,
              child: Material(
                color: const Color(0xE6D64545),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    _error!,
                    style: const TextStyle(color: Colors.white, fontSize: 12.5),
                  ),
                ),
              ),
            ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 12, 24, 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _CallBtn(
                      label: _muted ? 'Unmute' : 'Mute',
                      bg: _muted ? Colors.white : const Color(0x26FFFFFF),
                      fg: _muted ? const Color(0xFF12100F) : Colors.white,
                      onTap: _toggleMute,
                    ),
                    const SizedBox(width: 16),
                    _CallBtn(
                      label: _videoOff ? 'Cam On' : 'Cam Off',
                      bg: _videoOff ? Colors.white : const Color(0x26FFFFFF),
                      fg: _videoOff ? const Color(0xFF12100F) : Colors.white,
                      onTap: _toggleVideo,
                    ),
                    const SizedBox(width: 16),
                    _CallBtn(
                      label: 'End',
                      bg: const Color(0xFFD64545),
                      fg: Colors.white,
                      onTap: _endCall,
                    ),
                  ],
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
          textAlign: TextAlign.center,
          style: TextStyle(
            color: fg,
            fontSize: 11,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
