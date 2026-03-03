'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { Send, Loader, Phone, Video } from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatMessage {
  id: string
  content: string
  sender: any
  createdAt: string
  read: boolean
}

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [chatInfo, setChatInfo] = useState<any>(null)

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth/login')
      return
    }
    if (!params?.id) {
      return
    }

    fetchMessages()
    // Set up polling for new messages (in real app, use Socket.io)
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [params?.id, user, token])

  const fetchMessages = async () => {
    try {
      const response = await apiClient.getChatMessages(params.id as string, { limit: 50 })
      setMessages(response.data.data?.messages || [])
      if (response.data.data?.chat) {
        const chat = response.data.data.chat
        setChatInfo({
          ...chat,
          participants: (chat.participants || []).map((p: any) => p.user || p),
        })
      }
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!messageText.trim()) return

    setSending(true)
    try {
      await apiClient.sendMessage(params.id as string, {
        content: messageText,
      })
      setMessageText('')
      fetchMessages()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (!user) return null
  if (loading) return <div className="text-center py-12">Loading chat...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto h-full flex flex-col bg-white rounded-lg shadow">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {chatInfo?.participants?.find((p: any) => p.id !== user.id)?.firstName || 'Chat'}
            </h2>
            <p className="text-sm text-gray-600">Online</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Video size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender?.id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender?.id === user.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender?.id === user.id ? 'text-indigo-100' : 'text-gray-600'
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !sending && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || !messageText.trim()}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
