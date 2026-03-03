import io, { Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'

let socket: Socket | null = null

export const initializeSocket = () => {
  if (socket) return socket

  const token = useAuthStore.getState().token

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })

  return socket
}

export const getSocket = (): Socket | null => {
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Socket event emitters
export const socketEvents = {
  // Join/Leave
  joinGigChat: (gigId: string) => {
    socket?.emit('join-gig-chat', { gigId })
  },

  leaveGigChat: (gigId: string) => {
    socket?.emit('leave-gig-chat', { gigId })
  },

  // Messaging
  sendMessage: (chatId: string, content: string) => {
    socket?.emit('send-message', { chatId, content })
  },

  markAsRead: (messageId: string) => {
    socket?.emit('mark-as-read', { messageId })
  },

  typing: (gigId: string, isTyping: boolean) => {
    socket?.emit('typing', { gigId, isTyping })
  },

  // User presence
  userOnline: () => {
    socket?.emit('user-online')
  },

  userOffline: () => {
    socket?.emit('user-offline')
  },
}

// Socket event listeners
export const socketListeners = {
  onMessageReceived: (callback: (data: any) => void) => {
    socket?.on('message-received', callback)
  },

  onMessageRead: (callback: (data: any) => void) => {
    socket?.on('message-read', callback)
  },

  onUserTyping: (callback: (data: any) => void) => {
    socket?.on('user-typing', callback)
  },

  onUserOnline: (callback: (data: any) => void) => {
    socket?.on('user-online', callback)
  },

  onUserOffline: (callback: (data: any) => void) => {
    socket?.on('user-offline', callback)
  },

  // Cleanup
  removeAllListeners: () => {
    socket?.removeAllListeners()
  },
}
