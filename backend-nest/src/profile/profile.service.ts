import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

@Injectable()
export class ProfileService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  private bucket = process.env.SUPABASE_BUCKET || 'avatars';
  constructor(private prisma: PrismaService) { }

  async getProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatar_url: true },
    });

    const skills = await this.prisma.user_skills.findMany({
      where: { user_id: userId },
      select: { skill: true,skill_display: true, level: true },
      orderBy: { created_at: 'asc' },
    });

    return { user, skills };
  }

  async updateProfile(userId: string, body: any) {
    const { name, skills } = body;

    // ユーザー情報更新
    await this.prisma.users.update({
      where: { id: userId },
      data: { name },
    });

    // スキル再登録
    await this.prisma.user_skills.deleteMany({ where: { user_id: userId } });

    if (skills && skills.length > 0) {
      await this.prisma.user_skills.createMany({
        data: skills
          .filter((s) => s.skill.trim() !== '')
          .map((s) => ({
            user_id: userId,
            skill: s.skill.trim().toLowerCase(),
            skill_display: s.skill_display.trim(),
            level: s.level,
          })),
      });
    }

    return { message: 'プロフィールを更新しました' };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const fileName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;

    // Supabase Storage にアップロード
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw new Error('アップロード失敗: ' + error.message);

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.bucket).getPublicUrl(fileName);

    // DBに反映
    await this.prisma.users.update({
      where: { id: userId },
      data: { avatar_url: publicUrl },
    });

    return publicUrl;
  }
  
  
  async deleteAvatar(userId: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user?.avatar_url) return;

    // Supabase Storage のパスを抽出
    const filePath = user.avatar_url.split('/').pop();

    if (filePath) {
      await this.supabase.storage
        .from(this.bucket)
        .remove([filePath]);
    }

    // DB上のURLを null に更新
    await this.prisma.users.update({
      where: { id: userId },
      data: { avatar_url: null },
    });
  }
}
