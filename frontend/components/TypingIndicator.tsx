import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function TypingIndicator() {
  const prefersReducedMotion = useReducedMotion()

  const dotVariants = {
    hidden: { opacity: 0.3 },
    visible: { opacity: 1 },
  }

  if (prefersReducedMotion) {
    return (
      <div className="flex gap-1 items-center py-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50" />
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50" />
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50" />
      </div>
    )
  }

  return (
    <motion.div className="flex gap-1 items-center py-2">
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        variants={dotVariants}
        animate="visible"
        initial="hidden"
        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        variants={dotVariants}
        animate="visible"
        initial="hidden"
        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse', delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        variants={dotVariants}
        animate="visible"
        initial="hidden"
        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse', delay: 0.4 }}
      />
    </motion.div>
  )
}
