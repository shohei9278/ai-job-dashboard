import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { format, transports } from 'winston';
import * as path from 'path';

export const winstonConfig = {
  transports: [
    // コンソール出力
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        nestWinstonModuleUtilities.format.nestLike('AI-Job-Dashboard', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    // ファイル出力 (info以上)
    new transports.File({
      filename: path.join('logs', 'combined.log'),
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    }),
    // ファイル出力 (errorのみ)
    new transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    }),
  ],
};
