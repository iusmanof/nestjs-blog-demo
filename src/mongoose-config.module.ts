import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('process.env.MONGO_DB_URI: ' + process.env.MONGO_DB_URI);
        console.log(
          'process.env.MONGO_APP_PORT: ' + process.env.MONGO_APP_PORT,
        );
        const uri = config.get<string>('MONGO_DB_URI');

        if (!uri) {
          throw new Error('MONGO_DB_URI is not defined');
        }

        return {
          uri,
          connectionFactory: (connection: Connection) => {
            console.log('MongoDB connected:', connection.name);
            return connection;
          },
        };
      },
    }),
  ],
})
export class MongooseConfigModule {}
