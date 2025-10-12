import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY; 
    if (!url || !key) {
      throw new Error('SUPABASE_URL または SUPABASE_SERVICE_KEY が未設定');
    }

    this.client = createClient(url, key);
  }

  getClient() {
    return this.client;
  }

  async fetchLatestTrends() {
    const tables = [
      'job_insights',
      'job_trend_forecast',
      'job_count_summary',
    ];

    const results: Record<string, any[]> = {};
    for (const table of tables) {
      const { data, error } = await this.client
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        this.logger.error(`${table} fetch error: ${error.message}`);
        continue;
      }
      results[table] = data ?? [];
    }

    this.logger.log('Supabase最新データを取得');
    return results;
  }
}
