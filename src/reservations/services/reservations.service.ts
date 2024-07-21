import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { 
  CancelReservationResponseDto,
  GetAllReservationsResponseDto,
  InitializeTablesResponseDto,
  ReserveTablesResponseDto 
} from '../../dtos/reservations.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReservationsService {
  private totalTables: number = 0; // Total number of tables in the restaurant
  private availableTables: number = 0; // Number of available tables
  private tablesInitialized = false; // Flag to check if tables are initialized
  private reservationsMap = new Map<string, number>(); // Map of reservations with booking IDs and table indices

  /**
   * Check if the tables have been initialized.
   * @returns Boolean indicating if the tables have been initialized
   **/
  isTablesInitialized(): boolean {
    return this.tablesInitialized;
  }

  /**
   * Initialize the total number of tables in the restaurant.
   * @param totalTables - Number of tables to initialize
   * @returns Initialization message with total tables and customer limit
   */
  initializeTables(totalTables: number): InitializeTablesResponseDto {
    if (this.tablesInitialized) {
      throw new BadRequestException('Tables have already been initialized');
    }
    if (totalTables <= 0) {
      throw new BadRequestException('Total tables must be greater than zero');
    }
    this.totalTables = this.availableTables = totalTables;
    this.tablesInitialized = true;
    return {
      message: `Initialized ${totalTables} tables`,
      total: totalTables,
    };
  }

  /**
   * Reserve tables based on the number of customers.
   * @param customers - Number of customers for the reservation
   * @returns Reservation details including booking ID, tables booked, and remaining tables
   */
  reserveTables(customers: number): ReserveTablesResponseDto{
    if (customers <= 0) {
      throw new BadRequestException('Number of customers must be greater than zero');
    }
  
    const tablesNeeded = Math.ceil(customers / 4);

    if (this.availableTables < tablesNeeded) {
      throw new BadRequestException('Not enough tables available');
    }

    const bookingId = uuidv4();
    this.availableTables -= tablesNeeded;
    this.reservationsMap.set(bookingId, tablesNeeded);

    return {
      message: 'Reservation successful',
      data: {
        bookingId,
        tablesBooked: tablesNeeded,
        remainingTables: this.availableTables,
      }
    };
  }
  
  /**
   * Cancel a reservation based on the booking ID.
   * @param bookingId - Booking ID of the reservation to be canceled
   * @returns Cancellation details including freed tables and remaining tables
   */
  cancelReservation(bookingId: string): CancelReservationResponseDto {
    if (!this.tablesInitialized) {
      throw new BadRequestException('Tables have not been initialized');
    }
    const reservedTables = this.reservationsMap.get(bookingId);
    if (!reservedTables) {
      throw new NotFoundException('Booking ID not found');
    }

    // find value from this.reservationsMap and update this.availableTables
    this.availableTables += reservedTables;
    this.reservationsMap.delete(bookingId);

    return {
      message: 'Reservation cancelled',
      data:{
        tablesFreed: reservedTables,
        remainingTables: this.availableTables
      }
    };
  }

  /**
   * Get all reservations with total bookings, booking IDs and table indices.
   * @returns Map of reservations with booking IDs and table indices
   */
  getAllReservations(): GetAllReservationsResponseDto {
   
    const reservations = Array.from(this.reservationsMap.entries());
    if (reservations.length === 0) {
      throw new NotFoundException('No reservations found');
    }

    const reservationDetails = reservations.map(([bookingId, tablesBooked]) => {
      return {
        bookingId,
        tablesBooked,
      };
    });
    return {
      message: 'All reservations returned',
      total: this.reservationsMap.size,
      data: {
        reservationDetails
      }
    };

  }
}
