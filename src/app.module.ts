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
import { PromotionModule } from './models/promotions/promotion.module';
import { ProductModule } from './models/products/product.module';
import { MeilisearchConfigModule } from './config/meilisearch/config.module';
import { MeilisearchModule } from './providers/meilisearch/meilisearch.module';

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
    MeilisearchConfigModule,
    MeilisearchModule,
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
