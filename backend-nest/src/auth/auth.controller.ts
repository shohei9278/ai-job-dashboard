import { Controller, Post, Body, Res, Get, Req, UseGuards,HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private jwtService: JwtService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(email, password, res);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req['user'];
  }

  @Post('signup')
  @HttpCode(201)
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const { token, user } = await this.authService.signup(email, password, name);
    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
      sameSite: 'lax',
    });
    return { message: '登録完了', user };
   }
  
}

