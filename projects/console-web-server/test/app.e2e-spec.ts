import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  describe('/sample', () => {
    it('GET', () => {
      return request(app.getHttpServer()).get('/sample').expect(200).expect([]);
    });

    it('POST 201', () => {
      return request(app.getHttpServer())
        .post('/sample')
        .send({
          userId: 'test',
          password: 'test',
        })
        .expect(201);
    });

    it('POST 400', () => {
      return request(app.getHttpServer())
        .post('/sample')
        .send({
          userId: 'test',
          password: 'test',
          test: 'tttt',
        })
        .expect(400);
    });

    describe('/sample/:id', () => {
      it('GET 200', () => {
        return request(app.getHttpServer()).get('/sample/1').expect(200);
      });
      it('GET 404', () => {
        return request(app.getHttpServer()).get('/sample/9999').expect(404);
      });

      it('PATCH 200', () => {
        return request(app.getHttpServer())
          .patch('/sample/1')
          .send({
            userId: 'test1111',
            password: 'test11111',
          })
          .expect(200);
      });

      it('PATCH 404', () => {
        return request(app.getHttpServer())
          .patch('/sample/9999')
          .send({
            userId: 'test1111',
            password: 'test11111',
          })
          .expect(404);
      });

      it('DELETE 200', () => {
        return request(app.getHttpServer()).delete('/sample/1').expect(200);
      });

      it('DELETE 400', () => {
        return request(app.getHttpServer()).delete('/sample/9999').expect(404);
      });

      it('DELETE 404', () => {
        return request(app.getHttpServer()).delete('/sample').expect(404);
      });
    });
  });
});
