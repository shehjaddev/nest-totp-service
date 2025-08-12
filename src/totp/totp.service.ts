import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import * as CryptoJS from 'crypto-js';
import { authenticator } from 'otplib';

@Injectable()
export class TotpService {
    private encryptionKey: string;

    constructor(private prisma: PrismaClient, private configService: ConfigService) {
        const key = this.configService.get<string>('TOTP_ENCRYPTION_KEY');
        if (!key) {
            throw new Error('TOTP_ENCRYPTION_KEY is not set');
        }
        this.encryptionKey = key;
    }

    async generateSecret(email: string) {
        const secret = authenticator.generateSecret();
        const encryptedSecret = this.encryptSecret(secret);
        const otpauth = authenticator.keyuri(email, 'nest-totp-service', secret);

        // Upsert user and secret
        let user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await this.prisma.user.create({ data: { email } });
        }

        await this.prisma.tOTPSecret.upsert({
            where: { userId: user.id },
            update: { secret: encryptedSecret, enabled: true },
            create: { secret: encryptedSecret, userId: user.id, enabled: true },
        });

        return { secret, otpauth };
    }

    async verifyToken(email: string, token: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return false;

        const totpSecret = await this.prisma.tOTPSecret.findUnique({
            where: { userId: user.id },
        });

        if (!totpSecret || !totpSecret.enabled) return false;

        const decryptedSecret = this.decryptSecret(totpSecret.secret);
        return authenticator.check(token, decryptedSecret);
    }

    encryptSecret(secret: string): string {
        return CryptoJS.AES.encrypt(secret, this.encryptionKey).toString();
    }

    decryptSecret(ciphertext: string): string {
        const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) {
            throw new BadRequestException('Failed to decrypt TOTP secret');
        }
        return decrypted;
    }
}
