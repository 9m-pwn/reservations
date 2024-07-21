import { Controller, Get, Logger } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
@ApiExcludeController()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor() {}

  @Get()
  check() {
    this.logger.log('ـﮩ٨ـ Beep!');
    return { status: 'ok' };
  }
}