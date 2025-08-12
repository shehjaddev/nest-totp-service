import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as qrcodeTerminal from 'qrcode-terminal';
import { TotpService } from './totp.service';

@Controller('totp')
export class TotpController {
    constructor(private readonly totpService: TotpService) { }

    @Get("health")
    healthCheck() {
        return { status: "ok" };
    }

    @Post('setup')
    async setup(@Body('email') email: string) {
        const { secret, otpauth } = await this.totpService.generateSecret(email);

        const qrCodeDataURL = await QRCode.toDataURL(otpauth);

        qrcodeTerminal.generate(otpauth, { small: true }, (qrcode) => {
            console.log('\nScan this QR code with your Authenticator app:\n');
            console.log(qrcode);
        });

        return { secret, otpauth, qrCodeDataURL };
    }

    @Post('verify')
    async verify(@Body() body: { email: string; token: string }) {
        const { email, token } = body;

        if (!email || !token) {
            throw new BadRequestException('Missing email or token');
        }

        const isValid = await this.totpService.verifyToken(email, token);
        if (!isValid) {
            throw new BadRequestException('Invalid token');
        }

        return { verified: true };
    }
}
