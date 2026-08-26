import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type MeetingLink = {
  provider: 'jitsi' | 'zoom' | 'agora';
  meetingId: string;
  joinUrl: string;
  hostUrl: string;
};

export function jitsiRoomName(bookingNumber: string): string {
  const safe = bookingNumber.replace(/[^a-zA-Z0-9]/g, '');
  return `PoojaStore${safe}`;
}

export function jitsiMeeting(
  bookingNumber: string,
  baseUrl = 'https://meet.jit.si',
): MeetingLink {
  const room = jitsiRoomName(bookingNumber);
  const joinUrl = `${baseUrl.replace(/\/$/, '')}/${room}`;
  return {
    provider: 'jitsi',
    meetingId: room,
    joinUrl,
    hostUrl: joinUrl,
  };
}

export function agoraMeeting(bookingNumber: string, bookingId: string): MeetingLink {
  const channel = jitsiRoomName(bookingNumber);
  const deepLink = `poojastore://consultation/${bookingId}`;
  return {
    provider: 'agora',
    meetingId: channel,
    joinUrl: deepLink,
    hostUrl: deepLink,
  };
}

@Injectable()
export class MeetingLinkService {
  private readonly logger = new Logger(MeetingLinkService.name);

  constructor(private readonly config: ConfigService) {}

  async createForBooking(params: {
    bookingNumber: string;
    bookingId: string;
    serviceName: string;
    startsAt: Date;
    durationMinutes?: number;
  }): Promise<MeetingLink> {
    const provider = (this.config.get<string>('meetings.provider') ?? 'jitsi').toLowerCase();
    if (provider === 'agora') {
      return agoraMeeting(params.bookingNumber, params.bookingId);
    }
    if (provider === 'zoom') {
      try {
        const zoom = await this.createZoomMeeting(params);
        if (zoom) return zoom;
      } catch (error) {
        this.logger.warn(
          `Zoom meeting skipped: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }
    return jitsiMeeting(
      params.bookingNumber,
      this.config.get<string>('meetings.jitsiBaseUrl') ?? 'https://meet.jit.si',
    );
  }

  private async createZoomMeeting(params: {
    bookingNumber: string;
    serviceName: string;
    startsAt: Date;
    durationMinutes?: number;
  }): Promise<MeetingLink | null> {
    const accountId = this.config.get<string>('meetings.zoom.accountId') ?? '';
    const clientId = this.config.get<string>('meetings.zoom.clientId') ?? '';
    const clientSecret = this.config.get<string>('meetings.zoom.clientSecret') ?? '';
    if (!accountId || !clientId || !clientSecret) return null;

    const tokenRes = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!tokenRes.ok) return null;
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) return null;

    const meetingRes = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: `Pooja Store — ${params.serviceName} (${params.bookingNumber})`,
        type: 2,
        start_time: params.startsAt.toISOString(),
        duration: params.durationMinutes ?? 60,
        timezone: 'Asia/Kolkata',
        settings: {
          join_before_host: true,
          waiting_room: false,
          host_video: true,
          participant_video: true,
        },
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!meetingRes.ok) return null;
    const meeting = (await meetingRes.json()) as {
      id?: number | string;
      join_url?: string;
      start_url?: string;
    };
    if (!meeting.join_url) return null;
    return {
      provider: 'zoom',
      meetingId: String(meeting.id ?? params.bookingNumber),
      joinUrl: meeting.join_url,
      hostUrl: meeting.start_url ?? meeting.join_url,
    };
  }
}
