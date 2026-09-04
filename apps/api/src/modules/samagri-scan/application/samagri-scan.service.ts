import { Injectable } from '@nestjs/common';
import { GoogleVisionService } from '../infrastructure/google-vision.service';
import { SamagriMatchService } from './samagri-match.service';

@Injectable()
export class SamagriScanService {
  constructor(
    private readonly vision: GoogleVisionService,
    private readonly matcher: SamagriMatchService,
  ) {}

  async scanText(text: string) {
    return this.matcher.matchText(text);
  }

  async scanImage(image: Buffer, mimeType?: string) {
    const rawText = await this.vision.extractText(image, mimeType);
    const result = await this.matcher.matchText(rawText);
    return result;
  }
}
