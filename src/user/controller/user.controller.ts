import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../service/user.service';
import { ResponseUserDto } from '../dto/response-user.dto';
import { BusinessException } from 'src/exception/BusinessException';
import { Role, UserRole } from '../entities/user-role.entity';

interface responseUser{
    userName : string,
    userEmail : string,
    role : Role
}

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService){}


    //TODO : User Return이 아닌, Return DTO를 만들것.
    @Post('/signup')
    async signup(@Body() createUserDto : CreateUserDto): Promise<ResponseUserDto> {
        const responseUser = await this.userService.createUser(createUserDto);

        if(!responseUser) {
            throw new BusinessException(
                'user',
                'User created Fail',
                'User created Fail',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }

        return responseUser;
    }

}
