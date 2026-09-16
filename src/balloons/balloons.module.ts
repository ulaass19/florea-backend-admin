import {
  Module,
} from '@nestjs/common';

import {
  BalloonsController,
} from './balloons.controller';

import {
  BalloonsService,
} from './balloons.service';

@Module({
  controllers: [
    BalloonsController,
  ],

  providers: [
    BalloonsService,
  ],

  exports: [
    BalloonsService,
  ],
})
export class BalloonsModule {}