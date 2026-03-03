import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnimatedCardProps {
  children: ReactNode
  delay?: number
  onClick?: () => void
}

export default function AnimatedCard({ children, delay = 0, onClick }: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={!prefersReducedMotion ? { opacity: 0, y: 20, scale: 0.95 } : {}}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={!prefersReducedMotion ? {
        duration: 0.4,
        delay,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      } : {}}
      whileHover={!prefersReducedMotion ? { y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.div>
  )
}
