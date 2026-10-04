import { GuideRetrievalService } from './guide-retrieval.service';

describe('GuideRetrievalService', () => {
  const service = new GuideRetrievalService();

  it('finds Ganesh Chaturthi knowledge', () => {
    const result = service.retrieve('What is Ganesh Chaturthi?', 'en');
    expect(result.entries[0]?.id).toBe('festival-ganesh');
    expect(result.kitSlugs).toEqual(
      expect.arrayContaining(['ganesh-mini-home-puja']),
    );
  });

  it('keeps context for follow-up Samagri questions', () => {
    const result = service.retrieve(
      'What is Ganesh Chaturthi? What do I need for the Pooja?',
      'en',
    );
    expect(result.entries.some((e) => e.id.includes('ganesh'))).toBe(true);
    expect(result.entries[0]?.samagri?.length).toBeGreaterThan(0);
  });

  it('finds Varalakshmi from Telugu query tokens', () => {
    const result = service.retrieve('వరలక్ష్మి వ్రతం', 'te');
    expect(result.entries[0]?.id).toBe('festival-varalakshmi');
  });
});
