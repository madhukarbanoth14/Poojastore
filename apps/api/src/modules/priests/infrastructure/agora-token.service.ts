import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcRole, RtcTokenBuilder } from 'agora-token';

export type AgoraRtcCredentials = {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  expiresAt: number;
};

/** Map stable user ids to Agora numeric uids (must be non-zero). */
export function agoraUidFromUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (Math.imul(31, hash) + userId.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

@Injectable()
export class AgoraTokenService {
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.appId() && this.appCertificate());
  }

  appId(): string {
    return this.config.get<string>('meetings.agora.appId') ?? '';
  }

  createRtcToken(params: {
    channelName: string;
    userId: string;
    ttlSeconds?: number;
  }): AgoraRtcCredentials {
    const appId = this.appId();
    const appCertificate = this.appCertificate();
    if (!appId || !appCertificate) {
      throw new Error('Agora is not configured (AGORA_APP_ID / AGORA_APP_CERTIFICATE)');
    }

    const ttlSeconds = params.ttlSeconds ?? 3600;
    const now = Math.floor(Date.now() / 1000);
    const expireAt = now + ttlSeconds;
    const uid = agoraUidFromUserId(params.userId);
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      params.channelName,
      uid,
      RtcRole.PUBLISHER,
      expireAt,
      expireAt,
    );

    return {
      appId,
      channelName: params.channelName,
      token,
      uid,
      expiresAt: expireAt,
    };
  }

  private appCertificate(): string {
    return this.config.get<string>('meetings.agora.appCertificate') ?? '';
  }
}
