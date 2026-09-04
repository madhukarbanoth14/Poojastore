import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/priests_api.dart';
import '../../marketplace/presentation/samagri_scan_screen.dart';

class PoojariHomeScreen extends ConsumerStatefulWidget {
  const PoojariHomeScreen({super.key});

  @override
  ConsumerState<PoojariHomeScreen> createState() => _PoojariHomeScreenState();
}

class _PoojariHomeScreenState extends ConsumerState<PoojariHomeScreen> {
  Map<String, dynamic>? _data;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ref.read(priestsApiProvider).poojariAppointments();
      if (!mounted) return;
      setState(() {
        _data = data;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = '$error';
        _loading = false;
      });
    }
  }

  String get _firstName {
    final priest = _data?['priest'] as Map<String, dynamic>?;
    final fromProfile = priest?['fullName'] as String?;
    final fromUser = ref.read(authControllerProvider).user?.fullName;
    final full = (fromProfile ?? fromUser ?? 'Panditji').trim();
    if (full.isEmpty) return 'Panditji';
    return full.split(RegExp(r'\s+')).first;
  }

  @override
  Widget build(BuildContext context) {
    final today = ((_data?['today'] as List?) ?? const []).cast<Map<String, dynamic>>();
    final tomorrow =
        ((_data?['tomorrow'] as List?) ?? const []).cast<Map<String, dynamic>>();
    final upcoming =
        ((_data?['upcoming'] as List?) ?? const []).cast<Map<String, dynamic>>();

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            MaroonGradient(
              padding: const EdgeInsets.fromLTRB(22, 20, 22, 26),
              child: SafeArea(
                bottom: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'Pujari Desk',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                              color: AppColors.cream,
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.push('/profile'),
                          child: GoldAvatar(
                            initials: _firstName.substring(0, 1).toUpperCase(),
                            size: 34,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Namaste, $_firstName',
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w700,
                        fontSize: 24,
                        color: AppColors.cream,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${today.length} today · ${tomorrow.length} tomorrow',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.cream.withValues(alpha: 0.75),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(48),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              Padding(
                padding: const EdgeInsets.all(24),
                child: Text(_error!, style: const TextStyle(color: AppColors.body)),
              )
            else ...[
              _Section(
                title: 'Today',
                empty: 'No appointments today',
                items: today,
                priority: true,
              ),
              _Section(
                title: 'Tomorrow',
                empty: 'No appointments tomorrow',
                items: tomorrow,
                priority: true,
              ),
              _Section(
                title: 'Later',
                empty: 'No later appointments',
                items: upcoming,
              ),
              const SizedBox(height: 28),
            ],
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({
    required this.title,
    required this.empty,
    required this.items,
    this.priority = false,
  });

  final String title;
  final String empty;
  final List<Map<String, dynamic>> items;
  final bool priority;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  color: AppColors.maroon,
                ),
              ),
              if (priority) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.saffron,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'PRIORITY',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.4,
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 10),
          if (items.isEmpty)
            Text(empty, style: const TextStyle(color: AppColors.textMuted, fontSize: 13))
          else
            ...items.map((item) => _AppointmentCard(booking: item)),
        ],
      ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  const _AppointmentCard({required this.booking});

  final Map<String, dynamic> booking;

  @override
  Widget build(BuildContext context) {
    final slot = booking['slot'] as Map<String, dynamic>? ?? const {};
    final user = booking['user'] as Map<String, dynamic>? ?? const {};
    final online = booking['serviceMode'] == 'ONLINE';
    final starts = DateTime.tryParse(slot['startsAt'] as String? ?? '');
    final time = starts == null
        ? ''
        : '${starts.toLocal().hour.toString().padLeft(2, '0')}:${starts.toLocal().minute.toString().padLeft(2, '0')}';
    final devotee = (user['fullName'] as String?)?.trim().isNotEmpty == true
        ? user['fullName'] as String
        : user['phoneE164'] as String? ?? 'Devotee';

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.blush,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => context.push('/poojari/appointments/${booking['id']}'),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
            child: Row(
              children: [
                Container(
                  width: 54,
                  alignment: Alignment.center,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3DCC0),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    time,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: AppColors.maroon,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        booking['serviceName'] as String? ?? 'Consultation',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14.5,
                          color: AppColors.text,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '$devotee · ${online ? 'Online' : 'Home visit'}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  online ? 'Join' : 'Open',
                  style: const TextStyle(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w700,
                    fontSize: 12.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class PoojariAppointmentScreen extends ConsumerStatefulWidget {
  const PoojariAppointmentScreen({super.key, required this.id});

  final String id;

  @override
  ConsumerState<PoojariAppointmentScreen> createState() =>
      _PoojariAppointmentScreenState();
}

class _PoojariAppointmentScreenState
    extends ConsumerState<PoojariAppointmentScreen> {
  Map<String, dynamic>? _booking;
  List<Map<String, dynamic>> _sentLists = const [];
  String? _error;
  bool _loading = true;
  bool _joining = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final booking = await ref.read(priestsApiProvider).bookingDetail(widget.id);
      List<Map<String, dynamic>> sent = const [];
      try {
        sent = await ref
            .read(samagriScanApiProvider)
            .listSentForBooking(widget.id);
      } catch (_) {}
      if (!mounted) return;
      setState(() {
        _booking = booking;
        _sentLists = sent;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = '$error';
        _loading = false;
      });
    }
  }

  Future<void> _openCompose() async {
    final booking = _booking;
    if (booking == null) return;
    final user = booking['user'] as Map<String, dynamic>? ?? const {};
    final devotee = (user['fullName'] as String?)?.trim().isNotEmpty == true
        ? user['fullName'] as String
        : user['phoneE164'] as String? ?? 'Devotee';
    final sent = await context.push<bool>(
      '/poojari/appointments/${widget.id}/samagri'
          '?devotee=${Uri.encodeComponent(devotee)}'
          '&service=${Uri.encodeComponent(booking['serviceName'] as String? ?? 'Puja')}',
    );
    if (sent == true && mounted) _load();
  }

  Future<void> _join() async {
    setState(() => _joining = true);
    try {
      final meeting = await ref.read(priestsApiProvider).joinPoojariMeeting(widget.id);
      final url = (meeting['meetingHostUrl'] as String?) ??
          (meeting['meetingJoinUrl'] as String?);
      if (url == null) throw StateError('No meeting link yet');
      final uri = Uri.parse(url);
      final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!ok && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Open this link: $url')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$error')),
        );
      }
    } finally {
      if (mounted) setState(() => _joining = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final booking = _booking;
    final slot = booking?['slot'] as Map<String, dynamic>? ?? const {};
    final user = booking?['user'] as Map<String, dynamic>? ?? const {};
    final address = booking?['address'] as Map<String, dynamic>? ?? const {};
    final online = booking?['serviceMode'] == 'ONLINE';
    final starts = DateTime.tryParse(slot['startsAt'] as String? ?? '');

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.headerBar,
        title: const Text('Appointment'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
                  children: [
                    Text(
                      booking?['serviceName'] as String? ?? 'Consultation',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 22,
                        color: AppColors.maroon,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      starts == null ? '' : starts.toLocal().toString(),
                      style: const TextStyle(color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 16),
                    _kv('Devotee', user['fullName'] ?? '—'),
                    _kv('Phone', user['phoneE164'] ?? '—'),
                    _kv('Mode', online ? 'Online consultation' : 'Home visit'),
                    _kv('Booking', booking?['bookingNumber'] ?? '—'),
                    if (!online)
                      _kv(
                        'Address',
                        '${address['line1'] ?? ''}, ${address['city'] ?? ''}',
                      ),
                    if (online) ...[
                      const SizedBox(height: 8),
                      Text(
                        'Meeting: ${(booking?['meetingProvider'] as String? ?? 'jitsi').toUpperCase()}',
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TerracottaButton(
                        label: _joining ? 'Opening…' : 'Join video meeting',
                        loading: _joining,
                        onPressed: _joining ? null : _join,
                      ),
                    ],
                    const SizedBox(height: 24),
                    Text(
                      'Samagri list',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: AppColors.maroon,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Send the puja samagri list to this devotee in the app. They can review and add items to cart.',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textMuted,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TerracottaButton(
                      label: 'Send samagri list',
                      onPressed: _openCompose,
                    ),
                    if (_sentLists.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      Text(
                        '${_sentLists.length} list(s) sent',
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ],
                ),
    );
  }

  Widget _kv(String label, Object? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '$value',
            style: const TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.w600,
              color: AppColors.text,
            ),
          ),
        ],
      ),
    );
  }
}
