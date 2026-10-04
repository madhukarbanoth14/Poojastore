import {
  parseApiTxtResponse,
  toApiTxtMobile,
} from './apitxt-sms.sender';

describe('ApiTxtSmsSender helpers', () => {
  describe('toApiTxtMobile', () => {
    it('strips +91 to 10-digit national', () => {
      expect(toApiTxtMobile('+919876543210')).toEqual({
        mobiles: '9876543210',
        country: '91',
      });
    });

    it('handles bare 10-digit with fallback country', () => {
      expect(toApiTxtMobile('9876543210', '91')).toEqual({
        mobiles: '9876543210',
        country: '91',
      });
    });

    it('handles US +1 numbers', () => {
      expect(toApiTxtMobile('+12025550123')).toEqual({
        mobiles: '2025550123',
        country: '1',
      });
    });
  });

  describe('parseApiTxtResponse', () => {
    it('treats AUTH_FAILED as failure', () => {
      expect(
        parseApiTxtResponse(
          JSON.stringify({ status: 'AUTH_FAILED', message: 'Invalid Auth Key' }),
        ),
      ).toEqual({
        failed: true,
        message: 'Invalid Auth Key',
      });
    });

    it('treats numeric DLT error codes as failure', () => {
      expect(parseApiTxtResponse('105')).toEqual({
        failed: true,
        message: 'error code 105',
      });
    });

    it('accepts opaque success request ids', () => {
      expect(parseApiTxtResponse('abc123request')).toEqual({
        failed: false,
        ref: 'abc123request',
      });
    });

    it('accepts JSON success with request id', () => {
      expect(
        parseApiTxtResponse(
          JSON.stringify({ status: 'OK', request_id: 'req-9' }),
        ),
      ).toEqual({
        failed: false,
        ref: 'req-9',
        message: undefined,
      });
    });
  });
});
