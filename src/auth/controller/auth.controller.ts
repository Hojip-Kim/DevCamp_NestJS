import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(
    @Req() req,
    @Body() loginDto: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const { ip, method, originalUrl } = req;

    const reqInfo = {
      ip: ip,
      endpoint: `${method} ${originalUrl}`,
      ua: req.headers['user-agend'] || '',
    };

    return await this.authService.login(
      loginDto.userEmail,
      loginDto.userPassword,
      reqInfo,
    );
  }

  /*
  임시로 Request Body에 token담아놓음.
  */
  @Post('/logout')
  @UseGuards(AuthGuard('jwt-access'))
  async logout(@Req() req, @Body() body): Promise<void> {
    const { accessToken, refreshToken } = body;
    this.authService.logout(accessToken, refreshToken);
  }
}
