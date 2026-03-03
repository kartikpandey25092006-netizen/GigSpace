import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnimatedSkeletonProps {
  width?: string
  height?: string
  count?: number
  circle?: boolean
}

export default function AnimatedSkeleton({ width = 'w-full', height = 'h-4', count = 3, circle = false }: AnimatedSkeletonProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className="space-y-3">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`${width} ${circle ? 'rounded-full' : 'rounded'} ${height} bg-gray-300 opacity-50`}
            />
          ))}
      </div>
    )
  }

  return (
    <motion.div className="space-y-3">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`${width} ${circle ? 'rounded-full' : 'rounded'} ${height} bg-gray-300`}
          />
        ))}
    </motion.div>
  )
}
