import { Controller, Get, Post,Delete, UseGuards, Req, Body,UnauthorizedException,UseInterceptors,UploadedFile } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  // 詳細プロフィール取得
  @Get()
  async getProfile(@Req() req: Request) {    

    const userId = req.user?.sub ?? null; 
        if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    return this.profileService.getProfile(userId);
  }

  // プロフィール更新
  @Post()
  async updateProfile(@Req() req: Request, @Body() body: any) {
    const userId = req.user?.sub ?? null; 
    if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    return this.profileService.updateProfile(userId, body);
  }

  // プロフィール写真登録
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const userId = req.user?.sub ?? null; 
  if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    const url = await this.profileService.updateAvatar(userId, file);
    return { message: 'アップロード成功', avatarUrl: url };
   }
  
  // プロフィール写真削除
   @Delete('avatar')
  async deleteAvatar(@Req() req: Request) {
    const userId = req.user?.sub ?? null; 
    if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    await this.profileService.deleteAvatar(userId);
    return { message: '削除成功' };
  }
}
