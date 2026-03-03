import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function AnimatedButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
}: AnimatedButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  const baseClasses = 'font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2'

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <motion.button
      whileHover={!prefersReducedMotion && !disabled ? { scale: 1.05 } : {}}
      whileTap={!prefersReducedMotion && !disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading && (
        <motion.div animate={!prefersReducedMotion ? { rotate: 360 } : {}} transition={!prefersReducedMotion ? { duration: 1, repeat: Infinity } : {}}>
          ⚙️
        </motion.div>
      )}
      {children}
    </motion.button>
  )
}
