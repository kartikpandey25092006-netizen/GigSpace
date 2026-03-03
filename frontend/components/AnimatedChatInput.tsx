import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnimatedChatInputProps {
  onSend: (message: string) => void
  loading?: boolean
}

export default function AnimatedChatInput({ onSend, loading = false }: AnimatedChatInputProps) {
  const [message, setMessage] = useState('')
  const prefersReducedMotion = useReducedMotion()

  const handleSend = () => {
    if (message.trim()) {
      onSend(message)
      setMessage('')
    }
  }

  return (
    <motion.div
      initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={!prefersReducedMotion ? { duration: 0.4 } : {}}
      className="border-t bg-white p-4 rounded-lg"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50"
        />
        <motion.button
          whileHover={!prefersReducedMotion && !loading && message.trim() ? { scale: 1.05 } : {}}
          whileTap={!prefersReducedMotion && !loading && message.trim() ? { scale: 0.95 } : {}}
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <motion.div animate={!prefersReducedMotion ? { rotate: 360 } : {}} transition={!prefersReducedMotion ? { duration: 1, repeat: Infinity } : {}}>
              <Send size={16} />
            </motion.div>
          ) : (
            <Send size={16} />
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
