import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// API Client with typed methods
export const apiClient = {
  // Auth endpoints
  register: (data: any) => axiosInstance.post('/auth/register', data),
  login: (data: any) => axiosInstance.post('/auth/login', data),
  getProfile: () => axiosInstance.get('/auth/profile'),
  updateProfile: (data: any) => axiosInstance.put('/auth/profile', data),

  // Gig endpoints
  createGig: (data: any) => axiosInstance.post('/gigs/create', data),
  getGigs: (params?: any) => axiosInstance.get('/gigs/list', { params }),
  getGigById: (id: string) => axiosInstance.get(`/gigs/${id}`),
  acceptGig: (id: string, data: any) => axiosInstance.post(`/gigs/accept`, { gigId: id, ...data }),
  startGig: (id: string, data: any) => axiosInstance.post(`/gigs/start`, { gigId: id, ...data }),
  completeGig: (id: string, data: any) => axiosInstance.post(`/gigs/complete`, { gigId: id, ...data }),
  cancelGig: (id: string, data: any) => axiosInstance.post(`/gigs/cancel`, { gigId: id, ...data }),

  // Rental endpoints
  createRental: (data: any) => axiosInstance.post('/rentals/create', data),
  getRentals: (params?: any) => axiosInstance.get('/rentals/list', { params }),
  getRentalById: (id: string) => axiosInstance.get(`/rentals/${id}`),
  bookRental: (id: string, data: any) => axiosInstance.post(`/rentals/book`, { rentalId: id, ...data }),
  startRental: (id: string, data: any) => axiosInstance.post(`/rentals/start`, { orderId: id, ...data }),
  returnRental: (id: string, data: any) => axiosInstance.post(`/rentals/return`, { orderId: id, ...data }),
  reportDamage: (id: string, data: any) => axiosInstance.post(`/rentals/report-damage`, { orderId: id, ...data }),

  // Payment endpoints
  createPaymentOrder: (data: any) => axiosInstance.post('/payments/create-order', data),
  verifyPayment: (data: any) => axiosInstance.post('/payments/verify', data),
  refundPayment: (id: string, data: any) => axiosInstance.post(`/payments/refund`, { paymentId: id, ...data }),
  getPaymentHistory: (params?: any) => axiosInstance.get('/payments/history', { params }),

  // Chat endpoints
  createChat: (data: any) => axiosInstance.post('/chat/create', data),
  getChats: () => axiosInstance.get('/chat/list'),
  getChatMessages: (chatId: string, params?: any) => axiosInstance.get(`/chat/${chatId}/messages`, { params }),
  sendMessage: (chatId: string, data: any) => axiosInstance.post(`/chat/${chatId}/message`, data),
  deleteMessage: (messageId: string) => axiosInstance.delete(`/chat/message/${messageId}`),

  // Rating endpoints
  createRating: (data: any) => axiosInstance.post('/ratings/create', data),
  getLeaderboard: (params?: any) => axiosInstance.get('/leaderboard', { params }),
  getMyRank: () => axiosInstance.get('/ratings/leaderboard/my-rank'),

  // Admin gig controls
  getAdminGigLogs: (params?: any) => axiosInstance.get('/admin/gigs/logs', { params }),
  getAdminGigLogById: (id: string) => axiosInstance.get(`/admin/gigs/${id}/log`),
  updateAdminGig: (id: string, data: any) => axiosInstance.put(`/admin/gigs/${id}`, data),
  updateAdminGigStatus: (id: string, status: string) => axiosInstance.post(`/admin/gigs/${id}/status`, { status }),
  assignAdminGigWorker: (id: string, workerId: string) => axiosInstance.post(`/admin/gigs/${id}/assign`, { workerId }),
  deleteAdminGig: (id: string) => axiosInstance.delete(`/admin/gigs/${id}`),

  // Generic method for any request
  post: (url: string, data: any) => axiosInstance.post(url, data),
  get: (url: string, config?: any) => axiosInstance.get(url, config),
  put: (url: string, data: any) => axiosInstance.put(url, data),
  delete: (url: string) => axiosInstance.delete(url),
}

export default axiosInstance
