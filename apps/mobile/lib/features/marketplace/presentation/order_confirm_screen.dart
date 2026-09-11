import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/delivery_slot.dart';
import '../../../core/widgets/pp_ui.dart';

class OrderConfirmScreen extends StatelessWidget {
  const OrderConfirmScreen({
    super.key,
    this.orderId = '',
    this.amount = '₹0',
    this.slot = 'Within 24 hours',
    this.pendingUpi = false,
  });

  final String orderId;
  final String amount;
  final String slot;
  final bool pendingUpi;

  @override
  Widget build(BuildContext context) {
    final sunday = slot.toLowerCase().contains('sunday');
    return ConfirmSuccessScreen(
      title: pendingUpi ? 'Order placed' : 'Order Confirmed!',
      subtitle: pendingUpi
          ? 'We recorded your UPI reference. Packing starts after we confirm the credit on our bank statement.'
          : sunday
              ? 'Payment received. Your Ganesh kit will be packed and delivered on Sunday.'
              : 'Payment received. Your order will be packed and delivered within 24 hours.',
      rows: [
        ('Order ID', orderId),
        (pendingUpi ? 'Amount' : 'Amount Paid', amount),
        ('Delivery', slot),
      ],
      primaryLabel: 'Track delivery',
      onPrimary: orderId.isEmpty
          ? () => context.go('/')
          : () => context.go('/tracking/$orderId'),
      secondaryLabel: 'View order',
      onSecondary: orderId.isEmpty
          ? null
          : () => context.go('/orders/$orderId'),
    );
  }
}
