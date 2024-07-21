import { Module } from '@nestjs/common';

import { ReservationsModule } from './reservations/modules/reservations.module';
import { HealthController } from './health/health.controller';
@Module({
  imports: [ReservationsModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
