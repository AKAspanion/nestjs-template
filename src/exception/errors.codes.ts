export const errors = {
  GEN0500: {
    message: 'Something went wrong',
    statusCode: 500,
  },
  GEN0404: {
    message: 'Not found',
    statusCode: 404,
  },
  GEN0400: {
    message: 'Bad Request',
    statusCode: 404,
  },
  GEN0000: {
    message:
      'Invalid clientId: clientId is required and must be a non-empty string',
    statusCode: 400,
  },
  GEN0001: {
    message: 'Invalid clientId: The provided clientId does not exists',
    statusCode: 400,
  },
  GEN0002: {
    message: 'Invalid pagination params',
    statusCode: 400,
  },
  GEN0003: {
    message: 'Invalid pagination params: Max size is 100',
    statusCode: 400,
  },
  GEN1001: {
    message: 'Invalid access token received',
    statusCode: 400,
  },
  GEN1002: {
    message: 'Error creating access token',
    statusCode: 400,
  },
  GEN1003: {
    message: 'Error verifying with public EC key',
    statusCode: 400,
  },
  GEN1004: {
    message: 'Error signing with private EC key',
    statusCode: 400,
  },
  GEN1007: {
    message: 'Error decrypting data with RSA',
    statusCode: 400,
  },
  GEN1008: {
    message: 'Error encrypting data with RSA',
    statusCode: 400,
  },
  GEN1009: {
    message: 'Error decrypting data with AES',
    statusCode: 400,
  },
  GEN1010: {
    message: 'Error encrypting data with AES',
    statusCode: 400,
  },
};

export class Errors {
  static get(key: string): ErrorStatusMessage {
    const obj = errors[key];
    return obj ? obj : errors['GEN0500'];
  }
}

export type ErrorKeys = keyof typeof errors;

type ErrorStatusMessage = {
  message: string;
  statusCode: number;
};
