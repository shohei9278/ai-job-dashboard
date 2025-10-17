import { Injectable, UnauthorizedException,ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name?: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('このメールアドレスは既に登録されています');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser(email, hashed, name);
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { token, user };
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('ユーザーが存在しません');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('パスワードが正しくありません');

    const token = await this.generateToken(user.id, user.email);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7日
    });
    return {message: 'ログイン成功', email: user.email  };
  }

  async generateToken(id: string, email: string) {
    const payload = { sub: id, email: email };
    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string) {
    return this.jwtService.verifyAsync(token);
  }

   async logout(res: Response) {
    res.clearCookie('access_token');
    return { message: 'ログアウトしました' };
  }
}
