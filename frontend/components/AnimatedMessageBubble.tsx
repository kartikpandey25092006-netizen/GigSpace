import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnimatedMessageBubbleProps {
  message: string
  isOwn: boolean
  timestamp: string
  index: number
}

export default function AnimatedMessageBubble({ message, isOwn, timestamp, index }: AnimatedMessageBubbleProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={!prefersReducedMotion ? { opacity: 0, y: 10, scale: 0.95 } : {}}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={!prefersReducedMotion ? {
        duration: 0.3,
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      } : {}}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm break-words">{message}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-indigo-100' : 'text-gray-600'}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}
