import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ReservationsService } from '../../reservations/services/reservations.service';
import { ReservationsController } from '../../reservations/controllers/reservations.controller';

let testBookingId: string;
describe('ReservationController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [],
      controllers: [ReservationsController],
      providers: [ReservationsService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/');

    expect(response.status).toEqual(404);
  });

  it('should initialize tables successfully', async () => {
    const totalTables = 3;
    const response = {
      message: `Initialized ${totalTables} tables`,
      total: totalTables.toString(),
    };
    const result = await request(app.getHttpServer())
      .post('/reservations/initialize')
      .query({ totalTables });
    expect(result.body).toEqual(response);
  });

  it('should throw BadRequestException if totalTables is less than or equal to zero', async () => {
    const totalTables = 0;
    await request(app.getHttpServer())
      .post('/reservations/initialize')
      .query({ totalTables })
      .expect(400);
  });

  it('should reserve tables successfully', async () => {
    const customers = 3;
    const response = {
      message: 'Reservation successful',
      data: {
        bookingId: expect.any(String),
        tablesBooked: 1,
        remainingTables: 2,
      },
    };
    const result = await request(app.getHttpServer())
      .post('/reservations/reserve')
      .query({ customers });

    testBookingId = result.body.data.bookingId;
    expect(result.body).toEqual(response);
  });

  it('should queue group1 and group2 when submit at the same time', async () => {
    const customersGroup1 = 8;
    const customersGroup2 = 5;

    // trigger api call for group 1 and group 2 at the same time
    const responseGroup2Promise = request(app.getHttpServer())
      .post('/reservations/reserve')
      .query({ customers: customersGroup2 });

    const responseGroup1Promise = request(app.getHttpServer())
      .post('/reservations/reserve')
      .query({ customers: customersGroup1 });

    // wait for the response
    const [responseGroup1, responseGroup2] = await Promise.all([responseGroup2Promise, responseGroup1Promise]);

    // Extract the response messages
    const responseGroup1Msg = responseGroup1.body.message;
    const responseGroup2Msg = responseGroup2.body.message;

    // Check the results
    expect(responseGroup1.status).toBe(201);
    expect(responseGroup2.status).toBe(400); // or the status code you expect for insufficient tables

    expect(responseGroup1Msg).toEqual('Reservation successful');
    expect(responseGroup2Msg).toEqual('Not enough tables available');

  });

  it('should throw error if tables are not enough', async () => {
    const customers = 55;
    const response = await request(app.getHttpServer())
      .post('/reservations/reserve')
      .query({ customers });

    const { message, statusCode } = response.body;
    expect(message).toEqual('Not enough tables available');
    expect(statusCode).toEqual(400);
  });

  it('should throw BadRequestException if customers is less than or equal to zero', async () => {
    const customers = 0;
    await request(app.getHttpServer())
      .post('/reservations/reserve')
      .query({ customers })
      .expect(400);
  });

  it('should get all reservations', async () => {
    const result = await request(app.getHttpServer())
      .get('/reservations/all');
    
    expect(result.status).toEqual(200);
    expect(result.body.message).toEqual('All reservations returned');
    expect(result.body.data).toEqual(expect.any(Object));
  });

  it('should cancel reservation successfully', async () => {
    const result = await request(app.getHttpServer())
      .delete('/reservations/cancel')
      .query({ bookingId: testBookingId });
    
    expect(result.body.message).toEqual('Reservation cancelled');
    expect(result.status).toEqual(200);
  });

  it('should throw NotFoundException if bookingId is not found', async () => {
    await request(app.getHttpServer())
      .delete('/reservations/cancel')
      .query({ bookingId: 'invalid-booking-id' })
      .expect(404);
  });

  it('should reset tables', async () => {
    await request(app.getHttpServer())
      .post('/reservations/reset')
      .expect(205);
  });
});