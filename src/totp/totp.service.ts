import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';

@Injectable()
export class TotpService {
    constructor(private prisma: PrismaClient) { }

    async generateSecret(email: string) {
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(email, 'nest-totp-service', secret);

        // Upsert user and secret
        let user = await this.prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            user = await this.prisma.user.create({ data: { email } });
        }

        await this.prisma.tOTPSecret.upsert({
            where: { userId: user.id },
            update: { secret, enabled: true },
            create: { secret, userId: user.id, enabled: true },
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

        return authenticator.check(token, totpSecret.secret);
    }
}
