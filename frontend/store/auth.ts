import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  role: 'BUYER' | 'WORKER' | 'RENTAL_OWNER' | 'ADMIN'
  rating?: number
  completedGigs?: number
  totalEarnings?: number
  activeRentals?: number
  leaderboardRank?: number
  status: 'ACTIVE' | 'SUSPENDED' | 'BLACKLISTED'
  createdAt: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...userData,
            },
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
