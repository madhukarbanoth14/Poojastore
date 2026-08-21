import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/pp_ui.dart';

class OrderConfirmScreen extends StatelessWidget {
  const OrderConfirmScreen({
    super.key,
    this.orderId = '',
    this.amount = '₹0',
    this.slot = 'Today, 6–8 PM',
    this.eta = 'today, 7:00 PM',
  });

  final String orderId;
  final String amount;
  final String slot;
  final String eta;

  @override
  Widget build(BuildContext context) {
    return ConfirmSuccessScreen(
      title: 'Order Confirmed!',
      subtitle:
          'Payment received. Your order will be packed and delivered by $eta.',
      rows: [
        ('Order ID', orderId),
        ('Amount Paid', amount),
        ('Delivery Slot', slot),
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
