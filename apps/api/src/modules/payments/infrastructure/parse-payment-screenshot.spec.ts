import { parsePaymentScreenshot } from './parse-payment-screenshot';

describe('parsePaymentScreenshot', () => {
  it('accepts a JPEG data URL', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, ...Array(120).fill(0)]);
    const raw = `data:image/jpeg;base64,${jpeg.toString('base64')}`;
    const parsed = parsePaymentScreenshot(raw);
    expect(parsed.mimeType).toBe('image/jpeg');
    expect(parsed.image[0]).toBe(0xff);
  });

  it('rejects empty input', () => {
    expect(() => parsePaymentScreenshot('abc')).toThrow(/screenshot/i);
  });
});
