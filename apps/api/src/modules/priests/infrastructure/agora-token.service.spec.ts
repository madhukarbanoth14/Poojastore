import { agoraUidFromUserId } from './agora-token.service';

describe('agoraUidFromUserId', () => {
  it('returns a stable positive integer uid', () => {
    const uid = agoraUidFromUserId('11111111-1111-1111-1111-111111111111');
    expect(uid).toBeGreaterThan(0);
    expect(agoraUidFromUserId('11111111-1111-1111-1111-111111111111')).toBe(uid);
  });
});
