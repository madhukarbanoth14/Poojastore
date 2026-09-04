import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type VisionResponse = {
  responses?: Array<{
    fullTextAnnotation?: { text?: string };
    textAnnotations?: Array<{ description?: string }>;
    error?: { message?: string };
  }>;
};

@Injectable()
export class GoogleVisionService {
  constructor(private readonly config: ConfigService) {}

  async extractText(image: Buffer, mimeType?: string): Promise<string> {
    if (!mimeType?.startsWith('image/')) {
      throw new BadRequestException('Upload a JPEG or PNG photo of the list.');
    }

    const apiKey = this.config.get<string>('ocr.googleVisionApiKey', '');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Photo OCR is not configured on the server. Paste the list as text instead.',
      );
    }

    const payload = await this.annotate(apiKey, image, [
      { type: 'DOCUMENT_TEXT_DETECTION' },
      { type: 'TEXT_DETECTION' },
    ]);

    const first = payload.responses?.[0];
    if (first?.error?.message) {
      throw new ServiceUnavailableException(first.error.message);
    }

    const documentText = first?.fullTextAnnotation?.text?.trim() ?? '';
    const sparseText = first?.textAnnotations?.[0]?.description?.trim() ?? '';
    const text = documentText || sparseText;

    if (!text) {
      throw new BadRequestException(
        'Could not read any text from the photo. Try a clearer image or paste the list.',
      );
    }
    return text;
  }

  private async annotate(
    apiKey: string,
    image: Buffer,
    features: Array<{ type: string }>,
  ): Promise<VisionResponse> {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: image.toString('base64') },
              features,
              imageContext: { languageHints: ['te', 'en'] },
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new ServiceUnavailableException(
        `OCR request failed (${response.status}). ${body.slice(0, 180)}`,
      );
    }

    return (await response.json()) as VisionResponse;
  }
}
