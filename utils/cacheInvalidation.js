const { clearCache } = require("../middleware/cache");

/**
 * Invalidate all item-related caches
 */
const invalidateItemCache = async () => {
  await clearCache("/api/v1/items*");
  console.log("Invalidated item caches".magenta);
};

/**
 * Invalidate all batch-related caches
 */
const invalidateBatchCache = async () => {
  await clearCache("/api/v1/batches*");
  console.log("Invalidated batch caches".magenta);
};

/**
 * Invalidate all student-related caches
 */
const invalidateStudentCache = async () => {
  await clearCache("/api/v1/students*");
  console.log("Invalidated student caches".magenta);
};

/**
 * Invalidate all comment-related caches
 */
const invalidateCommentCache = async () => {
  await clearCache("/api/v1/comments*");
  console.log("Invalidated comment caches".magenta);
};

/**
 * Invalidate all caches
 */
const invalidateAllCache = async () => {
  await clearCache("*");
  console.log("Invalidated all caches".magenta);
};

module.exports = {
  invalidateItemCache,
  invalidateBatchCache,
  invalidateStudentCache,
  invalidateCommentCache,
  invalidateAllCache,
};
