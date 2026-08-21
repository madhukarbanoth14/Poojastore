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
  });

  final String priestName;
  final String modeLine;
  final String dateLabel;
  final String timeLabel;
  final String bookingId;
  final String ritual;
  final String fee;

  @override
  Widget build(BuildContext context) {
    return ConfirmSuccessScreen(
      title: 'Booking Confirmed!',
      subtitle: '$priestName will $modeLine on $dateLabel, $timeLabel.',
      rows: [
        ('Booking ID', bookingId),
        ('Ritual', ritual),
        ('Fee Paid', fee),
      ],
    );
  }
}
