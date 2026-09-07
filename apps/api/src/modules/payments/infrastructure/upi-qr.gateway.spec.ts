import { buildUpiPayUri, toPublicQrImageUrl } from './upi-qr.gateway';

describe('buildUpiPayUri', () => {
  it('encodes VPA, amount, and order note', () => {
    const uri = buildUpiPayUri({
      vpa: 'store@okhdfcbank',
      payeeName: 'Pavitra Seva',
      amountRupees: '499.00',
      note: 'Order PSABC123',
    });
    expect(uri.startsWith('upi://pay?')).toBe(true);
    const query = new URLSearchParams(uri.slice('upi://pay?'.length));
    expect(query.get('pa')).toBe('store@okhdfcbank');
    expect(query.get('pn')).toBe('Pavitra Seva');
    expect(query.get('am')).toBe('499.00');
    expect(query.get('cu')).toBe('INR');
    expect(query.get('tn')).toBe('Order PSABC123');
  });

  it('rewrites filesystem QR paths to the public image URL', () => {
    expect(
      toPublicQrImageUrl(
        '/Users/me/Pooja-store/apps/mobile/dist/QR-code.jpeg',
      ),
    ).toBe('/images/payments/company-upi-qr.jpeg');
    expect(toPublicQrImageUrl('/images/payments/company-upi-qr.jpeg')).toBe(
      '/images/payments/company-upi-qr.jpeg',
    );
    expect(toPublicQrImageUrl('')).toBeUndefined();
  });
});
