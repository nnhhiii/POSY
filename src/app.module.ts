import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CategoryModule } from './models/categories/category.module';
import { AuthModule } from './authentication/auth.module';
import { UserModule } from './models/users/user.module';
import { MailModule } from './mails/mail.module';
import {
  AppConfigModule,
  DatabaseConfigModule,
  JwtConfigModule,
  MailerSendConfigModule,
} from './config';
import { LoggerModule } from './logger/logger.module';
import { DeviceContextMiddleware } from './common/middleware/device-context.middleware';
import { AuthorizationModule } from './authorization/authorization.module';
import { MyProfileModule } from './my-profile/my-profile.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ActivityLogModule } from './models/activity-log/activity-log.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityLogInterceptor } from './common/interceptors/activity-log.interceptor';
import { PromotionModule } from './models/promotions/promotion.module';
import { ProductModule } from './models/products/product.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot(),
    AppConfigModule,
    DatabaseConfigModule,
    JwtConfigModule,
    MailerSendConfigModule,
    UserModule,
    CategoryModule,
    AuthModule,
    MailModule,
    LoggerModule,
    AuthorizationModule,
    MyProfileModule,
    ActivityLogModule,
    CommonModule,
    PromotionModule,
    ProductModule,
  ],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ActivityLogInterceptor,
    // },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DeviceContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
