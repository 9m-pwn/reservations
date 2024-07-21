import {
  Controller,
  Post,
  Query,
  BadRequestException,
  Get,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReservationsService } from '../services/reservations.service';
import {
  InitializationGuard,
  SkipInitializationCheck,
} from '../../guards/validate-initialize.decorator';
import { 
  CancelReservationResponseDto,
  GetAllReservationsResponseDto,
  InitializeTablesResponseDto,
  ReserveTablesResponseDto
} from '../../dtos/reservations.dto';

@ApiTags('reservations')
@Controller('reservations')
@UseGuards(InitializationGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('initialize')
  @SkipInitializationCheck() // Skip the initialization check for this route
  @ApiOperation({ summary: 'Initialize the total number of tables' })
  @ApiResponse({
    status: 201,
    description: 'The tables have been initialized.',
  })
  initializeTables(@Query('totalTables') totalTables: number): InitializeTablesResponseDto {
    if (totalTables <= 0) {
      throw new BadRequestException('Total tables must be greater than zero');
    }
    return this.reservationsService.initializeTables(totalTables);
  }

  @Post('reserve')
  @ApiOperation({ summary: 'Reserve tables for customers' })
  @ApiResponse({ status: 200, description: 'The tables have been reserved.' })
  reserveTables(@Query('customers') customers: number): ReserveTablesResponseDto {
    if (customers <= 0) {
      throw new BadRequestException(
        'Number of customers must be greater than zero',
      );
    }
    return this.reservationsService.reserveTables(customers);
  }

  @Delete('cancel-reservation')
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiResponse({
    status: 200,
    description: 'The reservation has been cancelled.',
  })
  cancelReservation(@Query('bookingId') bookingId: string): CancelReservationResponseDto {
    return this.reservationsService.cancelReservation(bookingId);
  }

  @Get('all-reservations')
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiResponse({ status: 200, description: 'All reservations returned.' })
  getAllReservations(): GetAllReservationsResponseDto {
    return this.reservationsService.getAllReservations();
  }
}
