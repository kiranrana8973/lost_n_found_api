import { BadRequestException } from '@nestjs/common';
import { ParseObjectIdPipe } from './parse-object-id.pipe';

describe('ParseObjectIdPipe', () => {
  let pipe: ParseObjectIdPipe;

  beforeEach(() => {
    pipe = new ParseObjectIdPipe();
  });

  it('should return the value for a valid ObjectId', () => {
    const validId = '507f1f77bcf86cd799439011';
    expect(pipe.transform(validId)).toBe(validId);
  });

  it('should throw BadRequestException for invalid ObjectId', () => {
    expect(() => pipe.transform('invalid-id')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for empty string', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });

  it('should accept a 24-character hex string', () => {
    const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    expect(pipe.transform(id)).toBe(id);
  });
});
