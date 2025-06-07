import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from './formatters'

// Khởi tạo 1 đối tượng Axios (authorizedAxiosInstance) để custom và cấu chung cho project
let authorizedAxiosInstance = axios.create()
// Thời gian chờ tối đa của 1 request: 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
// withCredentials: Cho phép axios tự động gửi cookie trong mỗi request lên BE (phục vụ lưu JWT tokens (refresh & access) vào httpOnly Cookie của trình duyệt)
authorizedAxiosInstance.defaults.withCredentials = true

// Cấu hình Interceptors (Bộ đánh chặn vào giữa mọi request & response)
// Interceptor Request: can thiệp vào giữa các request API
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Chặn spam click ()
  interceptorLoadingElements(true)

  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})

// Interceptor Response: can thiệp vào giữa các response API
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Chặn spam click ()
  interceptorLoadingElements(false)

  return response
}, (error) => {

  // Mọi mã http status code nằm ngoài khoảng 200 - 299 sẽ là error và rơi vào đây

  // Chặn spam click ()
  interceptorLoadingElements(false)

  // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API (viết code 1 lần)
  // clg error để hiện thị cấu trúc data dẫn tới message lỗi
  let errorMessage = error?.message
  if (error.response?.data?.message) {
    errorMessage = error.response?.data?.message
  }

  // toastify hiển thị mọi lỗi lên màn hình - ngoại trừ 410 - GONE phục vụ việc tự động refresh token
  if (error.response?.status !== 410) {
    toast.error(errorMessage)
  }
  return Promise.reject(error)
})

export default authorizedAxiosInstance