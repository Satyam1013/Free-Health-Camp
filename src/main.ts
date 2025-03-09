import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import cors from 'cors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )

  // Access PORT from ConfigService
  const configService = app.get(ConfigService)
  const port = process.env.PORT || configService.get<number>('PORT') || 3500

  await app.listen(port)
  console.log(`Application is running on port: ${port}`)
}
bootstrap()
