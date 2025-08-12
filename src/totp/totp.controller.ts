import { Body, Controller, Get, Post } from '@nestjs/common';
import { TotpService } from './totp.service';
import * as QRCode from 'qrcode';

@Controller('totp')
export class TotpController {
    constructor(private readonly totpService: TotpService) { }

    @Get("health")
    healthCheck() {
        return { status: "ok" };
    }

    @Post('setup')
    async setup(@Body('email') email: string) {
        const { secret, otpauth } = this.totpService.generateSecret(email);

        const qrCodeDataURL = await QRCode.toDataURL(otpauth);

        return { secret, otpauth, qrCodeDataURL };
    }
}
