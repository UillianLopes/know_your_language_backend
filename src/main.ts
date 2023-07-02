import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { config } from 'dotenv';
import * as session from 'express-session';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import * as process from 'process';

const ENV_FILES = {
  dev: 'environments/dev.env',
  prod: 'environments/prod.env',
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      cert: fs.readFileSync(process.env.SSL_CERT_FILE_PATH),
      key: fs.readFileSync(process.env.SSL_CERT_KEY_PATH),
    },
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Know Your Language API')
    .setVersion('1.0')
    .addTag('release-1.0')
    .addCookieAuth('connect.sid')
    .addBearerAuth()
    .build();

  app.use(
    session({
      secret: 'know_your_language_secret',
      resave: true,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 60,
        httpOnly: true,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/swagger', app, document);
  const port = process.env.PORT;

  console.log('PORT', port);
  await app.listen(port ?? 3000);
}

config({
  path: ENV_FILES[process.env.NODE_ENV],
});

bootstrap();
