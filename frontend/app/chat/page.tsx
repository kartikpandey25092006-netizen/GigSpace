'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { MessageCircle, Users, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface Chat {
  id: string
  participants: any[]
  lastMessage: string
  updatedAt: string
  unreadCount: number
}

export default function ChatPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth/login')
      return
    }
    fetchChats()
  }, [user, token, router])

  const fetchChats = async () => {
    try {
      const response = await apiClient.getChats()
      const rows = response.data.data?.chats || []
      const normalized = rows.map((chat: any) => ({
        id: chat.id,
        participants: (chat.participants || []).map((p: any) => p.user || p),
        lastMessage: chat.messages?.[0]?.content || '',
        updatedAt: chat.updatedAt,
        unreadCount: 0,
      }))
      setChats(normalized)
    } catch (error) {
      toast.error('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-100 mb-8">Messages</h1>

        {loading ? (
          <div className="text-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="inline-block">
              <MessageCircle className="text-indigo-400" size={32} />
            </motion.div>
            <p className="text-gray-400 mt-4">Loading chats...</p>
          </div>
        ) : chats.length > 0 ? (
          <motion.div className="space-y-3" initial="hidden" animate="visible" variants={{hidden: {opacity: 0}, visible: {opacity: 1, transition: {staggerChildren: 0.08, delayChildren: 0.2}}}}>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                variants={{hidden: {opacity: 0, x: -20}, visible: {opacity: 1, x: 0}}}
                whileHover={{scale: 1.01, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)'}}
                transition={{type: 'spring', stiffness: 300, damping: 30}}
                onClick={() => router.push(`/chat/${chat.id}`)}
                className="card-hover flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-100">
                      {chat.participants.find((p: any) => p.id !== user.id)?.firstName || 'Unknown'}
                    </h3>
                    {chat.unreadCount > 0 && (
                      <motion.span animate={{scale: [1, 1.1, 1]}} transition={{duration: 1.5, repeat: Infinity}} className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                        {chat.unreadCount}
                      </motion.span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-1">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}} className="text-center py-12 card">
            <motion.div animate={{y: [-2, 2, -2]}} transition={{duration: 2, repeat: Infinity}}>
              <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
            </motion.div>
            <p className="text-gray-400 text-lg">No chats yet</p>
            <p className="text-gray-500">Start a conversation by accepting a gig or contacting an item owner</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
