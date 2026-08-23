import { SocialProvider } from '@prisma/client';
import { socialPhoneNational } from './social-phone';

describe('socialPhoneNational', () => {
  it('is stable for the same provider and subject', () => {
    const a = socialPhoneNational(SocialProvider.GOOGLE, 'sub-123');
    const b = socialPhoneNational(SocialProvider.GOOGLE, 'sub-123');
    expect(a).toBe(b);
    expect(a).toMatch(/^5\d{9}$/);
  });

  it('differs across providers', () => {
    const google = socialPhoneNational(SocialProvider.GOOGLE, 'same-sub');
    const apple = socialPhoneNational(SocialProvider.APPLE, 'same-sub');
    expect(google).not.toBe(apple);
  });
});
