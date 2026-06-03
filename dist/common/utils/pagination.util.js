"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginatedResponse = paginatedResponse;
function paginatedResponse(data, total, page, limit) {
    return {
        success: true,
        count: data.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data,
    };
}
//# sourceMappingURL=pagination.util.js.map