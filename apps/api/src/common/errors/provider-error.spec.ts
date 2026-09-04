import { providerErrorMessage, providerHttpStatus } from './provider-error';

describe('providerErrorMessage', () => {
  it('reads Razorpay-style error objects that are not Error instances', () => {
    const thrown = {
      statusCode: 400,
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'The id provided does not exist',
      },
    };
    expect(providerErrorMessage(thrown)).toBe('The id provided does not exist');
    expect(providerHttpStatus(thrown)).toBe(400);
  });

  it('parses string status codes', () => {
    expect(providerHttpStatus({ statusCode: '400' })).toBe(400);
  });

  it('falls back when the payload has no message', () => {
    expect(providerErrorMessage({}, 'Internal server error')).toBe(
      'Internal server error',
    );
  });
});
