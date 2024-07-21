import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { ReservationsService } from '../../reservations/services/reservations.service';

let app: INestApplication;
let reservationsService: ReservationsService;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  reservationsService = app.get(ReservationsService);
});

afterAll(async () => {
  await app.close();
});

describe('initialize application', () => {
  it('should be defined', () => {
    return expect(app).toBeDefined();
  });

  it('health check', () => {
    return request('http://localhost:3000')
      .get('/health')
      .expect(200);
  });
});

describe('reservations', () => {
    let bookingId: string;

    beforeEach(async () => {
        reservationsService.resetTables();
    });

    it('should init total tables', async () => {
        const result = await request('http://localhost:3000')
        .post('/api/v1/reservations/initialize')
        .query({ totalTables: 10 })
        .expect(201)
        .then(response => response.body)
        const { message, total } = result;
        expect(result).toBeDefined();
        expect(message).toEqual("Initialized 10 tables");
        expect(total).toEqual('10');
    });

    it('should reserve tables', async () => {
        const result = await request('http://localhost:3000')
        .post('/api/v1/reservations/reserve')
        .query({ customers: 6 })
        .expect(201)
        .then(response => response.body);

        const { message, data } = result;
        bookingId = data.bookingId;
        expect(result).toBeDefined();
        expect(message).toEqual("Reservation successful");
        expect(data.bookingId).toBeDefined();
        expect(data.tablesBooked).toEqual(2);
        expect(data.remainingTables).toEqual(8);
    });

    it('should cancel reservation', async () => {
        const result = await request('http://localhost:3000')
        .delete('/api/v1/reservations/cancel')
        .query({ bookingId })
        .expect(200)
        .then(response => response.body);

        const { message } = result;
        expect(result).toBeDefined();
        expect(message).toEqual("Reservation cancelled");
    });

    it('should throw BadRequestException if totalTables is less than or equal to zero', async () => {
        await request('http://localhost:3000')
        .post('/api/v1/reservations/initialize')
        .query({ totalTables: 0 })
        .expect(400);
    });

    it('should throw BadRequestException if customers is less than or equal to zero', async () => {
        await request('http://localhost:3000')
        .post('/api/v1/reservations/reserve')
        .query({ customers: 0 })
        .expect(400);
    });

    it('should throw NotFoundException if bookingId is not found', async () => {
        await request('http://localhost:3000')
        .delete('/api/v1/reservations/cancel')
        .query({ bookingId: 'some-booking-id' })
        .expect(404);
    });

    it('should throw BadRequestException if totalTables is not provided', async () => {
        await request('http://localhost:3000')
        .post('/api/v1/reservations/initialize')
        .query({ totalTables: null })
        .expect(400);
    });

    it('should reset tables', async () => {
        const result = await request('http://localhost:3000')
        .post('/api/v1/reservations/reset')
        .expect(205)
        .then(response => response.body);

       
    });
});
