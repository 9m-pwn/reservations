// create HealthController class
import { SkipInitializationCheck } from '@/guards/validate-initialize.decorator';
import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor() {}

  @Get()
  check() {
    this.logger.log('ـﮩ٨ـ Beep!');
    return { status: 'ok' };
  }
}