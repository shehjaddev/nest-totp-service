import { Controller, Get } from '@nestjs/common';

@Controller('totp')
export class TotpController {
    @Get("health")
    healthCheck() {
        return { status: "ok" };
    }
}
