export type RequestInfo = {
    ip: string;
    ua: string; // user-agent
    endpoint: string;
}

export type TokenPayload = {
    sub: string; // user id
    iat: number;
    jti: string;
}