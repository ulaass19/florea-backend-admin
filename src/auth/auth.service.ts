import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email
      .trim()
      .toLowerCase();

    const admin =
      await this.prisma.adminUser.findUnique({
        where: {
          email,
        },
      });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException(
        'E-posta veya şifre hatalı.',
      );
    }

    const passwordValid =
      await bcrypt.compare(
        dto.password,
        admin.passwordHash,
      );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'E-posta veya şifre hatalı.',
      );
    }

    const accessToken =
      await this.jwtService.signAsync({
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      });

    return {
      accessToken,

      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async me(adminId: string) {
    const admin =
      await this.prisma.adminUser.findUnique({
        where: {
          id: adminId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException(
        'Kullanıcı bulunamadı veya pasif.',
      );
    }

    return admin;
  }
}