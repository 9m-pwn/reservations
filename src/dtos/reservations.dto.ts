import { ApiProperty } from "@nestjs/swagger";

export class BaseResponseDto {
    @ApiProperty()
    message: string;
}

export class InitializeTablesResponseDto extends BaseResponseDto {
    @ApiProperty()
    total: number;
}

class ReservationDataDto {
    @ApiProperty()
    bookingId: string;
  
    @ApiProperty()
    tablesBooked: number;
  
    @ApiProperty()
    remainingTables: number;
}

export class ReserveTablesResponseDto extends BaseResponseDto {
    @ApiProperty()
    data: ReservationDataDto;
}

class CancelReservationDataDto {
    @ApiProperty()
    tablesFreed: number;
  
    @ApiProperty()
    remainingTables: number;
}

export class CancelReservationResponseDto extends BaseResponseDto {
    @ApiProperty()
    data: CancelReservationDataDto;
}

class ReservationDetailsDto  {
    @ApiProperty()
    bookingId: string;
    @ApiProperty()
    tablesBooked: number;
}

class GetAllReservationsDataDto {
    @ApiProperty({ type: [ReservationDetailsDto] })
    reservationDetails: ReservationDetailsDto[];
}
  
export class GetAllReservationsResponseDto extends BaseResponseDto {
@ApiProperty()
total: number;

@ApiProperty()
data: GetAllReservationsDataDto;
}