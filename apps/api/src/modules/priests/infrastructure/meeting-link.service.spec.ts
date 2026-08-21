import { jitsiMeeting, jitsiRoomName } from './meeting-link.service';

describe('Jitsi meeting links', () => {
  it('builds a stable room from the booking number', () => {
    expect(jitsiRoomName('PB-ABC 12')).toBe('PoojaStorePBABC12');
    const meeting = jitsiMeeting('PB1A2B');
    expect(meeting.provider).toBe('jitsi');
    expect(meeting.joinUrl).toBe('https://meet.jit.si/PoojaStorePB1A2B');
    expect(meeting.hostUrl).toBe(meeting.joinUrl);
  });
});
