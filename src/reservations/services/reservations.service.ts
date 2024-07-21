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
  private queueLock = false; // Lock for reservation operations

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
  async reserveTables(customers: number): Promise<ReserveTablesResponseDto>{
    if (customers <= 0) {
      throw new BadRequestException('Number of customers must be greater than zero');
    }
  
    // Calculate the number of tables needed based on the number of customers
    const tablesNeeded = Math.ceil(customers / 4);

    // Check if the reservation queue is busy
    if(this.queueLock) {
      throw new BadRequestException('Reservation queue is busy');
    }

    // Use lockQueue() for preventing race conditions
    this.lockQueue();
    try {
      // Check table availability
      if (this.availableTables < tablesNeeded) {
        throw new BadRequestException('Not enough tables available');
      }

      const bookingId = uuidv4();
      this.availableTables -= tablesNeeded; // Update the available tables

      // Add the reservation to the map
      this.reservationsMap.set(bookingId, tablesNeeded); 

      return {
        message: 'Reservation successful',
        data: {
          bookingId,
          tablesBooked: tablesNeeded,
          remainingTables: this.availableTables,
        }
      };
    } finally {
      // Release the lock after reservation is done
      this.releaseQueue();
    }
  }

  /**
   * Reset the tables to their initial state.
   */
  resetTables() {
    this.totalTables = 0;
    this.availableTables = 0;
    this.tablesInitialized = false;
    this.reservationsMap.clear();

    return {
      message: 'Tables have been reset',
    };
  }
  
  /**
   * Cancel a reservation based on the booking ID.
   * @param bookingId - Booking ID of the reservation to be canceled
   * @returns Cancellation details including freed tables and remaining tables
   */
  cancelReservation(bookingId: string): CancelReservationResponseDto {
    
    // Find value from this.reservationsMap
    const reservedTables = this.reservationsMap.get(bookingId);
    if (!reservedTables) {
      throw new NotFoundException('Booking ID not found');
    }

    // free the reserved tables to available tables
    this.availableTables += reservedTables;
    
    // Validate that availableTables does not exceed totalTables
    if (this.availableTables > this.totalTables) {
      throw new Error('Inconsistent state: availableTables exceeds totalTables');
    }
    
    // Remove the reservation from the map
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
    // Convert the reservations map to an array
    const reservations = Array.from(this.reservationsMap.entries());
    if (reservations.length === 0) {
      throw new NotFoundException('No reservations found');
    }

    // Convert the reservations array to an array of objects for readability
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

  /**
   * Lock the queue for reservation operations.
   */
  private async lockQueue(): Promise<void> {
    const maxWaitTime = 5000; // Maximum wait time in milliseconds
    const startTime = Date.now();

    while (this.queueLock) {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Unable to acquire lock within the maximum wait time');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.queueLock = true;
  }

  /**
   * Release the lock for reservation operations.
   */
  private releaseQueue(): void {
    this.queueLock = false;
  }
}
