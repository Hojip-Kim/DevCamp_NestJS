export class LoginResponseDto {
    accessToken : string;
    refreshToken : string;
    user: {
        id: string;
        userName: string;
        userEmail : string;
    }
}