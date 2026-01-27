import { Global, Module } from '@nestjs/common';
import { CoreThrottlerModule } from './guards/throttler/throttler.module';

@Global()
@Module({
  imports: [CoreThrottlerModule],
  exports: [CoreThrottlerModule],
})
export class CoreModule {}
