import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }
  
  // ユーザー作成
  async createUser(email: string, password: string, name?: string) {
    return this.prisma.users.create({
      data: { email, password, name },
    });
  }

  // アドレス検索
  async findByEmail(email: string) {
    return this.prisma.users.findUnique({ where: { email } });
  }

  // ID検索
  async findById(id: string) {
    return this.prisma.users.findUnique({ where: { id } });
  }
}
