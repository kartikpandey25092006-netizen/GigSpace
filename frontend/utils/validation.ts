/**
 * Zod validation schemas for frontend forms
 */

import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  city: z.string().min(2, 'City must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const createGigSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  budget: z.number().min(100, 'Budget must be at least ₹100'),
  deadline: z.string(),
  category: z.string(),
  location: z.string().min(3, 'Location must be specified'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
})

export const createRentalSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  pricePerHour: z.number().optional(),
  pricePerDay: z.number().optional(),
  deposit: z.number().min(0),
  location: z.string().min(3, 'Location must be specified'),
  category: z.string(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
})

export const createRatingSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().max(500).optional(),
  type: z.enum(['GIG', 'RENTAL']),
  targetId: z.string(),
})

export type RegisterForm = z.infer<typeof registerSchema>
export type LoginForm = z.infer<typeof loginSchema>
export type CreateGigForm = z.infer<typeof createGigSchema>
export type CreateRentalForm = z.infer<typeof createRentalSchema>
export type CreateRatingForm = z.infer<typeof createRatingSchema>
