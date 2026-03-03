'use client'

import { useCallback } from 'react'

export const useLocalStorage = (key: string) => {
  const getItem = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  }, [key])

  const setItem = useCallback((value: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  }, [key])

  const removeItem = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }, [key])

  return { getItem, setItem, removeItem }
}
