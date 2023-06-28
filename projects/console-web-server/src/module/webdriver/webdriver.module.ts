import { Module } from '@nestjs/common';
import { WebDriverController } from './webdriver.controller';
import { WebDriverService } from './webdriver.service';

@Module({
  imports: [],
  providers: [WebDriverService],
  exports: [WebDriverService],
  controllers: [WebDriverController],
})
export class WebDriverModule {}
