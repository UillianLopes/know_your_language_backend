import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { config } from 'dotenv';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      cert: fs.readFileSync('ssl/local.knowyourlanguage.com.crt'),
      key: fs.readFileSync('ssl/local.knowyourlanguage.com.key'),
    },
  });

  app.setGlobalPrefix('api/v1');
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Know Your Language API')
    .setVersion('1.0')
    .addTag('release-1.0')
    .addCookieAuth('connect.sid')
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
  await app.listen(3000);
}
config({
  path: 'environments/.env',
});
bootstrap();
