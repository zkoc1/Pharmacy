import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı.');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Hatalı şifre.');
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { access_token: token, user: { id: user.id, email: user.email, role: user.role } };
  }
}
