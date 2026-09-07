import { BadRequestException } from '@nestjs/common';

const MAX_BYTES = 2_000_000;
const ALLOWED: Record<string, string> = {
  '/9j/': 'image/jpeg',
  iVBOR: 'image/png',
  UklGR: 'image/webp',
};

export function parsePaymentScreenshot(raw: string): {
  mimeType: string;
  image: Uint8Array<ArrayBuffer>;
} {
  const trimmed = raw.trim();
  const dataUrl = trimmed.match(
    /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i,
  );
  const b64 = (dataUrl?.[2] ?? trimmed).replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]+=*$/.test(b64) || b64.length < 80) {
    throw new BadRequestException('Upload a JPEG, PNG, or WebP payment screenshot');
  }
  let image: Buffer;
  try {
    image = Buffer.from(b64, 'base64');
  } catch {
    throw new BadRequestException('Payment screenshot could not be read');
  }
  if (!image.length || image.length > MAX_BYTES) {
    throw new BadRequestException('Payment screenshot must be under 2 MB');
  }
  const head = b64.slice(0, 8);
  const mimeType =
    dataUrl?.[1]?.toLowerCase().replace('image/jpg', 'image/jpeg') ??
    Object.entries(ALLOWED).find(([prefix]) => head.startsWith(prefix))?.[1];
  if (!mimeType || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new BadRequestException('Upload a JPEG, PNG, or WebP payment screenshot');
  }
  if (mimeType === 'image/jpeg' && image[0] !== 0xff) {
    throw new BadRequestException('Upload a JPEG, PNG, or WebP payment screenshot');
  }
  const copy = new Uint8Array(new ArrayBuffer(image.byteLength));
  copy.set(image);
  return { mimeType, image: copy };
}
