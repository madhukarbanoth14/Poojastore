final hyderabadPin = RegExp(r'^500\d{3}$');

const hyderabadDeliveryMessage =
    'We are currently delivering in Hyderabad.';

bool isHyderabadDelivery({String? postalCode}) {
  final pin = (postalCode ?? '').replaceAll(RegExp(r'\D'), '');
  return hyderabadPin.hasMatch(pin);
}
