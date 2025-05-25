/**
 * Capitalize the first letter of a string
 */
export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

// Phía FE sẽ tự tạo ra 1 card đặc biệt: Placeholder Card, ko liên quan tới BE
// Card đặc biệt này sẽ được ẩn ở UI user
// Cấu trúc Id của card này để unique rất đơn giản, ko cần random
// "columnId-placeholder-card" (mỗi column chỉ có thể có tối đa 1 PlaceholderCard)
// Khi tạo phải đầy đủ: (_id, boardId, columnId, FE_PlaceholderCard)
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}