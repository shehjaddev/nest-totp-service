import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';

@Injectable()
export class TotpService {
    generateSecret(email: string) {
        const secret = authenticator.generateSecret();

        const otpauth = authenticator.keyuri(email, 'nest-totp-service', secret);

        return { secret, otpauth };
    }
}
