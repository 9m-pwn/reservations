import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from '../controllers/reservations.controller';
import { ReservationsService } from '../services/reservations.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InitializationGuard } from '../../guards/validate-initialize.decorator';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        ReservationsService,
        {
          provide: InitializationGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  describe('initializeTables', () => {
    it('should initialize tables successfully', () => {
      const totalTables = 10;
      const response = {
        message: `Initialized ${totalTables} tables`,
        total: totalTables,
        totalCustomerLimit: totalTables * 4,
      };

      jest.spyOn(service, 'initializeTables').mockImplementation(() => response);

      expect(controller.initializeTables(totalTables)).toEqual(response);
    });

    it('should throw BadRequestException if totalTables is less than or equal to zero', () => {
      const totalTables = 0;

      expect(() => controller.initializeTables(totalTables)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('reserveTables', () => {
    it('should reserve tables successfully', () => {
      const customers = 6;
      const response = {
        message: 'Reservation successful',
        bookingId: 'some-booking-id',
        tablesBooked: 2,
        remainingTables: 8,
      };

      jest.spyOn(service, 'reserveTables').mockImplementation(() => (response as any));

      expect(controller.reserveTables(customers)).toEqual(response);
    });

    it('should throw BadRequestException if customers is less than or equal to zero', () => {
      const customers = 0;

      expect(() => controller.reserveTables(customers)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelReservation', () => {
    it('should cancel reservation successfully', () => {
      const bookingId = 'some-booking-id';
      const response = {
        message: 'Reservation cancelled',
        data: {
          tablesFreed: 2,
          remainingTables: 10,
        }
      };

      jest.spyOn(service, 'cancelReservation').mockImplementation(() => response);

      expect(controller.cancelReservation(bookingId)).toEqual(response);
    });

    it('should throw NotFoundException if bookingId is not found', () => {
      const bookingId = 'invalid-booking-id';

      jest.spyOn(service, 'cancelReservation').mockImplementation(() => {
        throw new NotFoundException('Booking ID not found');
      });

      expect(() => controller.cancelReservation(bookingId)).toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllReservations', () => {
    it('should get all reservations successfully', () => {
      const response = {
        message: 'All reservations returned',
        total: 3,
        data: {
          reservationDetails: [
            { bookingId: '0ded2a09-0ddc-4398-bac7-e6551caa35ad', tablesBooked: 1 },
            { bookingId: '453db3de-7ad3-44aa-8244-44256abf1251', tablesBooked: 1 },
            { bookingId: '6f55ca89-b21e-49d1-8f6e-55a6c0504fc8', tablesBooked: 1 },
          ],
        },
      };

      jest.spyOn(service, 'getAllReservations').mockImplementation(() => (response));

      expect(controller.getAllReservations()).toEqual(response);
    });
  });
});
