import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;
        const elapsed = Date.now() - now;
        const size = data ? JSON.stringify(data).length : 0;
        const kb = (size / 1024).toFixed(2);

        this.logger.log(
          `[${method}] ${url} → ${statusCode} (${elapsed}ms, ${kb}KB)`,
        );
      }),
    );
  }
}
