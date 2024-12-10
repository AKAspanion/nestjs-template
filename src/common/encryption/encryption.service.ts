import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { AppException } from 'src/exception/http-exception.filter';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private publicKeyRSA: string;
  private privateKeyRSA: string;
  private publicKeyEC: string;
  private privateKeyEC: string;

  constructor() {
    this.publicKeyRSA = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEArPopMNaxxT46WRLHJqIfAEQTshxf8OsELLloJl/78tfbbsQ0OlOkn7YRj1T7jnCLxWvLcdW+mGxUmd5bib3U5sfrwU8R8IIY7cYXQ9whiz4RqDKtTCj5Vo1g/OTy1nDoh1qld6yNny7k+HYFhqG9RBnHK9DLyO9uSV0KOAqdyasyUd7jMHt0n9mGoqw8Srd+zkPPZ4IPDNwP620DsAvlLARmBpx3eazIzwLaYrYS8ka8AhcWgaP2/p2WsCEirHZsdNNWZP0vOWMPuofumbSwst5z1/bBL2OCMedVFjshYXmR0svNtnPmBSnc0jfhVcWcS8UD5qVKkHUtCk4u2bodOwIDAQAB
-----END RSA PUBLIC KEY-----`;

    this.privateKeyRSA = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArPopMNaxxT46WRLHJqIfAEQTshxf8OsELLloJl/78tfbbsQ0OlOkn7YRj1T7jnCLxWvLcdW+mGxUmd5bib3U5sfrwU8R8IIY7cYXQ9whiz4RqDKtTCj5Vo1g/OTy1nDoh1qld6yNny7k+HYFhqG9RBnHK9DLyO9uSV0KOAqdyasyUd7jMHt0n9mGoqw8Srd+zkPPZ4IPDNwP620DsAvlLARmBpx3eazIzwLaYrYS8ka8AhcWgaP2/p2WsCEirHZsdNNWZP0vOWMPuofumbSwst5z1/bBL2OCMedVFjshYXmR0svNtnPmBSnc0jfhVcWcS8UD5qVKkHUtCk4u2bodOwIDAQABAoIBAAHb1sjEghMcwqjtMn6mmxiOz+SLuQpSLSGLFAZ9EgbX5ckn3WjAOCsAIDVbQz9WPVOr4VVtOpEzj2UrpkgqC7G/KlZRrNfpAq7cWsbwmxfn84vqclDefQYCQFMkiyWZ0mmcSd4xdpq3D3bRrdlJdB2ODC6P4XdNpMNklUId2TSu9mYEY3v5bKD3PiWp5y3fqBfmjsSWv8uGPeeuriB9lXosX270438ArPiFlHIg/BgxzUTDtCmYRljtBOREtlHg/i07YgoEFEJI4Qc7+azATHOzDhEZkYZ743D7s46kx9Nb9led23lIm/CsH4ZqfXFmyn/g1Ez7QIbheGFxXShWr8ECgYEA8+DifgVoWFw57ccGZ8BEimMZe4dXA0wVZIu+n6+RPk6SyOclNaYV4MA2IyauuFycZD32xf5ue/101LshnFzO+s8H/WLJdJ0xPy5f6wDr1iCx8mSX99wOnoXBHd3qJJUup3JnSrmPOKkDdTdQ5s77ix9fULkXfg8DNgde2ATF8TkCgYEAtZMgdR3UMg/AbA0nMRVDtbZ/O41rZe7+QmjgihvehfAEJXMV4mlLj8e8SKkpcWu/yvym8s9CgKQStrY7kZm4BGIVg1ohMlotXC55n8W95VlNemF0lXk40aZ5PiaoyZk4l3omqO9DbjLQix59OcZXO3uWj0e37nTqaDl4L/rQ5hMCgYEAxV/L7pIR0PFTMM1SscU5s4ZgqUjvcwuwhJ9Ut4gv1G1i/pWT18eDDVKCfhBgd3T8XWSIw9UXNeH7G/AXU6UJHpNPtBKvWGGf6bJujpNASxxK6BHhrAe9DS7TDIj9Zn4WNA6y6hcjgofG9KbAIwyBKCdLzNj/2lXsE14DtHCogoECgYABGkmiLHIzc6EJhvLr+2MT4W3YYL18Ov1UTeq/K/gn/BMqXw6M93K8Bsx/7HcR90OM6gfhhZyzx0tNzMGD2tkhPa8/wvZcpeuMmcOnUr4afHZZ/emFVt0feNFXrUhtIP8U/Grrr7hLHQfjMGY2SZwSAmghqp/VVORviZnPQMiv/QKBgEyle2b+oCG68Bf8Qq5+NhAMkxYphaDqvySGviccoqLBZTX5oRgspVfIvpuHINUgqnNAM2iZs9EFTTiKa5GKTy3MDKRkM3nE+9AcnBgi6l7pwZfkW/h0h4OlDBPXe9uTgWlydskc3wVNutErq6i3fxOjZRJbQ3TSeMYAzD3KFqXG
-----END RSA PRIVATE KEY-----`;

    this.privateKeyEC = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIDS/vPg9HYHjxmUueRwC7cQbQS56sTuBtyOtmjjV4nj5oAcGBSuBBAAK\noUQDQgAEDAI7LOv1d8/yAwlv7lLuB2nxGai4LWWd673hqkgNSz5AzX1kD8vlpFTU\n4IR6a9aMMOKNUfSxM5z9bATHM/9FUg==
-----END EC PRIVATE KEY-----`;

    this.publicKeyEC = `-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEDAI7LOv1d8/yAwlv7lLuB2nxGai4LWWd\n673hqkgNSz5AzX1kD8vlpFTU4IR6a9aMMOKNUfSxM5z9bATHM/9FUg==
-----END PUBLIC KEY-----`;
  }

  encryptAES(text: string, secret: string, ivText: string) {
    try {
      const secretKey = Buffer.from(secret, 'utf8');
      const iv = Buffer.from(ivText, 'utf8');
      const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      this.logger.log('AES encypted');
      return `${iv}:${encrypted}`;
    } catch (error) {
      throw new AppException('GEN1010', error);
    }
  }

  decryptAES(text: string, secret: string) {
    try {
      const secretKey = Buffer.from(secret, 'utf8');
      const [ivHex, encrypted] = text.split(':');
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        secretKey,
        Buffer.from(ivHex, 'utf8'),
      );
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      this.logger.log('AES decrypted');
      return decrypted;
    } catch (error) {
      throw new AppException('GEN1009', error);
    }
  }

  encryptRSA(data: any): string {
    try {
      const buffer = Buffer.from(data, 'utf8');
      const encrypted = crypto.publicEncrypt(this.publicKeyRSA, buffer);
      this.logger.log('RSA encrypted');
      return encrypted.toString('base64');
    } catch (error) {
      throw new AppException('GEN1008', error);
    }
  }

  decryptRSA(data: string): string {
    try {
      const buffer = Buffer.from(data, 'base64');
      const decrypted = crypto.privateDecrypt(this.privateKeyRSA, buffer);
      this.logger.log('RSA decrypted');
      return decrypted.toString('utf8');
    } catch (error) {
      throw new AppException('GEN1007', error);
    }
  }

  signWithECPrivateKey(payload: { data: string; privateKey: string }): string {
    try {
      const buffer = Buffer.from(payload.data, 'utf8');
      const signer = crypto.createSign('SHA256');
      signer.update(buffer);

      this.logger.log('Signed with EC Private Key');
      return signer.sign(payload.privateKey, 'base64');
    } catch (error) {
      throw new AppException('GEN1004', error);
    }
  }

  verifyWithECPublicKey(payload: {
    data: string;
    signature: string;
    publicKey: string;
  }): boolean {
    try {
      const buffer = Buffer.from(payload.data, 'utf8');
      const verifier = crypto.createVerify('SHA256');
      verifier.update(buffer);

      this.logger.log('Verified with EC Public Key');
      return verifier.verify(payload.publicKey, payload.signature, 'base64');
    } catch (error) {
      throw new AppException('GEN1003', error);
    }
  }

  getVector(bytes = 8) {
    const iv = crypto.randomBytes(bytes);
    return iv.toString('hex');
  }

  getPrivateKeyEC() {
    return this.privateKeyEC;
  }

  getPublicKeyEC() {
    return this.publicKeyEC;
  }
}
