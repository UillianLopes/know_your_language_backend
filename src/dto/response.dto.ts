import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty({
    name: 'message',
    nullable: true,
    description: 'This property handles ',
  })
  readonly message: string | null;

  @ApiProperty({
    name: 'data',
    description: 'message',
    nullable: true,
  })
  readonly data: T | null;

  protected constructor(message: string | null, data: T | null) {
    this.message = message;
    this.data = data;
  }

  static create<T>(message: string, data: T | null = null): ResponseDto<T> {
    return new ResponseDto(message, data);
  }
}
export class ListResponseDto<T = any> extends ResponseDto<T[]> {
  readonly total: number | null;
  readonly chunkSize: number | null;

  private constructor(
    message: string | null = null,
    data: T[] | null = null,
    total: number | null = null,
    chunckSize: number | null = null,
  ) {
    super(message, data);
    this.total = total;
    this.chunkSize = chunckSize;
  }

  static withMessage<T>(
    message: string | null,
    data: T[],
    total: number,
    chunkSize: number,
  ): ListResponseDto<T> {
    return new ListResponseDto(message, data, total, chunkSize);
  }

  static withoutMessage<T>(data: T[], total: number, chunkSize: number) {
    return new ListResponseDto(null, data, total, chunkSize);
  }
}
