export declare function paginatedResponse<T>(data: T[], total: number, page: number, limit: number): {
    success: boolean;
    count: number;
    total: number;
    page: number;
    pages: number;
    data: T[];
};
