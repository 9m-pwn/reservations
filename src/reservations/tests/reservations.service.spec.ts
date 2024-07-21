import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from '../services/reservations.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationsService],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  describe('initializeTables', () => {
    it('should initialize tables successfully', () => {
      const result = service.initializeTables(10);
      expect(result).toEqual({
        message: 'Initialized 10 tables',
        total: 10,
      });
      expect(service.isTablesInitialized()).toBe(true);
    });

    it('should throw error if tables are already initialized', () => {
      service.initializeTables(10);
      expect(() => service.initializeTables(5)).toThrow(BadRequestException);
    });

    it('should throw error if totalTables is zero or negative', () => {
      expect(() => service.initializeTables(0)).toThrow(BadRequestException);
      expect(() => service.initializeTables(-5)).toThrow(BadRequestException);
    });
  });

  describe('reserveTables', () => {
    beforeEach(() => {
      service.initializeTables(10); // Initialize tables before each reservation test
    });

    it('should reserve tables successfully', async () => {
      const result = await service.reserveTables(8); // Reserve 8 customers (2 tables)
      expect(result).toEqual({
        message: 'Reservation successful',
        data: {
          bookingId: expect.any(String),
          tablesBooked: 2,
          remainingTables: 8,
        },
      });
    });

    it('should throw error if not enough tables are available', async () => {
      await service.reserveTables(8); // Reserve 8 customers (2 tables)
      await expect(() => service.reserveTables(99)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if customers number is zero or negative', async () => {
      await expect(() => service.reserveTables(0)).rejects.toThrow(BadRequestException);
      await expect(() => service.reserveTables(-5)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if reservation queue is locked', async () => {
      (service as any).lockQueue();
      await expect(() => service.reserveTables(4)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelReservation', () => {
    let bookingId: string;

    beforeEach(async () => {
      service.initializeTables(10);
      const result = await service.reserveTables(4); // Reserve 4 customers (1 table)
      bookingId = result.data.bookingId;
    });

    it('should cancel reservation successfully', () => {
      const result = service.cancelReservation(bookingId);
      expect(result).toEqual({
        message: 'Reservation cancelled',
        data:{
          tablesFreed: 1,
          remainingTables: 10,
        }
      });
    });

    it('should throw error if reservation does not exist', () => {
      expect(() => service.cancelReservation('non-existing-id')).toThrow(NotFoundException);
    });

    it('should throw error if tables are not initialized', () => {
      const uninitializedService = new ReservationsService();
      expect(() => uninitializedService.cancelReservation('some-id')).toThrow(BadRequestException);
    });
  });

  describe('getAllReservations', () => {
    beforeEach(async () => {
      service.initializeTables(10);
      await service.reserveTables(4); // Reserve 4 customers
    });

    it('should return all reservations', () => {
      const result = service.getAllReservations();
      expect(result).toEqual({
        message: 'All reservations returned',
        total: 1,
        data: {
          reservationDetails: [
            expect.objectContaining({
              bookingId: expect.any(String),
              tablesBooked: 1,
            }),
          ],
        },
      });
    });

    it('should throw error if no reservations found', () => {
      const result = service.getAllReservations();
      const bookingId = result.data.reservationDetails[0].bookingId;
      service.cancelReservation(bookingId);
      
      expect(() => service.getAllReservations()).toThrow(NotFoundException);
    });
  });
});
