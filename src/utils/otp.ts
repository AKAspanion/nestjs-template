import { generate } from 'randomstring';

export function generateOTP() {
  return generate({
    length: 6,
    charset: 'numeric',
  });
}
