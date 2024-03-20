import { HttpStatus } from '@nestjs/common';

export type ErrorDomain = 'generic' | 'auth' | 'user' | 'payment';

export class BusinessException extends Error {
  public readonly id: string;
  public readonly timestamp: Date;

  constructor(
    public readonly domain: ErrorDomain,
    public readonly message: string, // 로깅 메시지
    public readonly apiMessage: string, // 사용자 메시지
    public readonly status: HttpStatus,
  ) {
    super(message);
    this.id = BusinessException.genId();
    this.timestamp = new Date();
  }

  private static genId(length = 12): string {
    // 인자로 length를 제공받지않을경우 12로 고정함.
    const p = 'ABCASADWKJRKLQWRKLQWRMWLKRQWRLK123456';

    return [...Array(length)].reduce(
      (a) => a + p[Math.floor(Math.random() * p.length)],
      '',
    );
  }
}
