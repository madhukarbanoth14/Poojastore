export const PUSH_SENDER = Symbol('PUSH_SENDER');

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export interface PushSenderPort {
  sendToTokens(tokens: string[], payload: PushPayload): Promise<void>;
}
