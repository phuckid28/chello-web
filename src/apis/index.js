import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

// Phía FE ko cần thiết làm vậy với mọi request vì gây ra dư thừa code catch lỗi
// Giải pháp: catch lỗi tập trung bằng Interceptors (đánh chặn vào giữa request hoặc response để xử lý logic cần thiết)
export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  // axios sẽ trả kết quả qua poperty của nó là data
  return response.data
}