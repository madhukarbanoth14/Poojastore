import 'package:flutter/material.dart';
import '../../../core/widgets/pp_ui.dart';

class BookingConfirmScreen extends StatelessWidget {
  const BookingConfirmScreen({
    super.key,
    this.priestName = 'Panditji',
    this.modeLine = 'visit your home',
    this.dateLabel = 'Today',
    this.timeLabel = '9–11 AM',
    this.bookingId = 'PB-70542',
    this.ritual = 'Griha Pravesh',
    this.fee = '₹0',
    this.pendingUpi = false,
  });

  final String priestName;
  final String modeLine;
  final String dateLabel;
  final String timeLabel;
  final String bookingId;
  final String ritual;
  final String fee;
  final bool pendingUpi;

  @override
  Widget build(BuildContext context) {
    return ConfirmSuccessScreen(
      title: pendingUpi ? 'Booking placed' : 'Booking Confirmed!',
      subtitle: pendingUpi
          ? 'We recorded your UPI reference. $priestName is confirmed after we verify the credit.'
          : '$priestName will $modeLine on $dateLabel, $timeLabel.',
      rows: [
        ('Booking ID', bookingId),
        ('Ritual', ritual),
        (pendingUpi ? 'Fee' : 'Fee Paid', fee),
      ],
    );
  }
}
