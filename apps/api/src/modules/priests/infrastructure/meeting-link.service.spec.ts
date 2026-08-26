import { agoraMeeting, jitsiMeeting, jitsiRoomName } from './meeting-link.service';

describe('Jitsi meeting links', () => {
  it('builds a stable room from the booking number', () => {
    expect(jitsiRoomName('PB-ABC 12')).toBe('PoojaStorePBABC12');
    const meeting = jitsiMeeting('PB1A2B');
    expect(meeting.provider).toBe('jitsi');
    expect(meeting.joinUrl).toBe('https://meet.jit.si/PoojaStorePB1A2B');
    expect(meeting.hostUrl).toBe(meeting.joinUrl);
  });

  it('builds an agora deep link for in-app calls', () => {
    const meeting = agoraMeeting('PB1A2B', 'booking-uuid');
    expect(meeting.provider).toBe('agora');
    expect(meeting.meetingId).toBe('PoojaStorePB1A2B');
    expect(meeting.joinUrl).toBe('poojastore://consultation/booking-uuid');
  });
});
