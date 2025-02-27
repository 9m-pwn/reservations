import { Module } from '@nestjs/common';
import { ReservationsController } from '../controllers/reservations.controller';
import { ReservationsService } from '../services/reservations.service';

@Module({
  imports: [],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
