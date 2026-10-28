import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from './formatters'
import { refreshTokenAPI } from '~/apis'
import { logoutUserAPI } from '~/redux/user/userSlice'

// Không thể import { store } từ '~/redux/store' theo cách thông thường ở đây
// Giải pháp: Inject store từ src/main.jsx khi ứng dụng khởi chạy
let axiosReduxStore
export const injectStore = mainStore => {
  axiosReduxStore = mainStore
}

// Khởi tạo 1 đối tượng Axios (authorizedAxiosInstance) để custom và cấu hình chung cho project
let authorizedAxiosInstance = axios.create()
// Thời gian chờ tối đa của 1 request: 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
// withCredentials: Cho phép axios tự động gửi cookie trong mỗi request lên BE (phục vụ lưu JWT tokens vào httpOnly Cookie của trình duyệt)
authorizedAxiosInstance.defaults.withCredentials = true

// Interceptor Request: can thiệp vào giữa các request API
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Chặn spam click
  interceptorLoadingElements(true)

  return config
}, (error) => {
  return Promise.reject(error)
})

// Khởi tạo một cái promise cho việc gọi api refresh_token
// Mục đích để khi nhận nhiều request bị lỗi 410 cùng lúc thì chỉ gọi 1 lần refresh_token
let refreshTokenPromise = null

// Interceptor Response: can thiệp vào giữa các response API
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Chặn spam click
  interceptorLoadingElements(false)

  return response
}, (error) => {
  // Chặn spam click
  interceptorLoadingElements(false)

  // Trường hợp 1: Nếu nhận mã 401 từ BE, gọi api đăng xuất luôn
  if (error.response?.status === 401 && axiosReduxStore) {
    axiosReduxStore.dispatch(logoutUserAPI(false))
  }

  // Trường hợp 2: Nếu nhận mã 410 từ BE, tự động gọi api refresh token để làm mới lại accessToken
  const originalRequests = error.config
  if (error.response?.status === 410 && originalRequests && !originalRequests._retry) {
    originalRequests._retry = true

    if (!refreshTokenPromise) {
      refreshTokenPromise = refreshTokenAPI()
        .then(data => {
          return data?.accessToken
        })
        .catch((_error) => {
          if (axiosReduxStore) {
            axiosReduxStore.dispatch(logoutUserAPI(false))
          }
          return Promise.reject(_error)
        })
        .finally(() => {
          refreshTokenPromise = null
        })
    }

    return refreshTokenPromise.then(() => {
      return authorizedAxiosInstance(originalRequests)
    })
  }

  // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API
  let errorMessage = error?.message
  if (error.response?.data?.message) {
    errorMessage = error.response?.data?.message
  }

  // Ngoại trừ mã 410 - GONE phục vụ việc tự động refresh token
  if (error.response?.status !== 410) {
    toast.error(errorMessage)
  }
  return Promise.reject(error)
})

export default authorizedAxiosInstance
