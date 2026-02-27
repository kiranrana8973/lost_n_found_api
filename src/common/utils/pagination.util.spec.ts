import { paginatedResponse } from './pagination.util';

describe('paginatedResponse', () => {
  it('should return correct paginated response', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = paginatedResponse(data, 20, 1, 10);
    expect(result).toEqual({
      success: true,
      count: 2,
      total: 20,
      page: 1,
      pages: 2,
      data,
    });
  });

  it('should calculate pages correctly', () => {
    const result = paginatedResponse([], 15, 1, 10);
    expect(result.pages).toBe(2);
  });

  it('should handle single page', () => {
    const result = paginatedResponse([{ id: 1 }], 1, 1, 10);
    expect(result.pages).toBe(1);
  });

  it('should handle empty data', () => {
    const result = paginatedResponse([], 0, 1, 10);
    expect(result).toEqual({
      success: true,
      count: 0,
      total: 0,
      page: 1,
      pages: 0,
      data: [],
    });
  });
});
