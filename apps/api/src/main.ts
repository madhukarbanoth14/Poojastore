import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { attachSentry, initSentry } from './core/observability/sentry';

async function bootstrap() {
  initSentry();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  const config = app.get(ConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);
  attachSentry(app);

  app.use(helmet());
  app.enableCors({
    origin: config.get<string[]>('corsOrigins')?.length
      ? config.get<string[]>('corsOrigins')
      : true,
    credentials: true,
  });

  const prefix = config.get<string>('apiPrefix', 'api');
  app.setGlobalPrefix(prefix);
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (config.get<boolean>('swaggerEnabled')) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Pooja Store API')
      .setDescription('Hindu Spiritual Super App — production API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = config.get<number>('port', 3000);
  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}/${prefix}/v1`);
  logger.log(`Swagger at http://localhost:${port}/docs`);
}

void bootstrap();
