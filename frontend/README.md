# GigSpace Frontend

The modern, responsive Next.js frontend for GigSpace - a campus marketplace platform.

## 🏗️ Project Structure

```
frontend/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout with Header & Footer
│   ├── page.tsx        # Home page
│   ├── auth/           # Authentication pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/      # User dashboard
│   ├── gigs/           # Gig marketplace pages
│   ├── rentals/        # Rental listings
│   ├── chat/           # Messaging
│   ├── leaderboard/    # Rankings
│   └── profile/        # User profile
├── components/         # Reusable React components
│   ├── Header.tsx
│   └── Footer.tsx
├── store/              # Zustand state management
│   └── auth.ts
├── services/           # API & Socket.io clients
│   ├── api.ts
│   └── socket.ts
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
│   ├── helpers.ts
│   └── validation.ts
├── app/
│   └── globals.css     # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── .env.local.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend running on `http://localhost:3002`

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3002
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
   NEXT_PUBLIC_RAZORPAY_KEY=your_key_here
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_name_here
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📄 Pages

### Public Pages
- **Home** (`/`) - Landing page with features and CTA
- **Login** (`/auth/login`) - User login
- **Register** (`/auth/register`) - User registration
- **Gigs** (`/gigs`) - Browse all gigs
- **Rentals** (`/rentals`) - Browse rental items
- **Leaderboard** (`/leaderboard`) - View rankings

### Protected Pages (Authentication Required)
- **Dashboard** (`/dashboard`) - User overview and stats
- **Chat** (`/chat`) - Messaging interface
- **Profile** (`/profile`) - User account & settings
- **Gig Detail** (`/gigs/:id`) - Single gig view
- **Rental Detail** (`/rentals/:id`) - Single rental view

## 🎨 Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Custom theme colors** - Primary (indigo), Secondary (pink), Accent (amber)
- **Responsive design** - Mobile-first approach
- **Dark mode ready** - Can be easily extended

## 🔑 Key Features

### Authentication
- Zustand-based auth store with localStorage persistence
- JWT token management
- Automatic logout on 401 errors
- Protected routes via server components

### API Integration
- Axios client with request/response interceptors
- Automatic token attachment to headers
- Error handling and user feedback via toast
- Type-safe API methods

### State Management
- Zustand for auth state (user, token, isAuthenticated)
- localStorage persistence
- Easy access via hooks throughout app

### Real-time Communication
- Socket.io client integration
- Room-based messaging
- Event emitters and listeners
- Typing indicators and read receipts

### UI Components
- Header with responsive navigation
- Footer with links and social
- Cards, buttons, forms with Tailwind
- Icons via lucide-react

## 🔗 API Integration

All API methods are in `services/api.ts`:

```typescript
// Auth
apiClient.register(data)
apiClient.login(data)
apiClient.getProfile()
apiClient.updateProfile(data)

// Gigs
apiClient.createGig(data)
apiClient.getGigs(params)
apiClient.getGigById(id)
apiClient.acceptGig(id, data)
apiClient.startGig(id, data)
apiClient.completeGig(id, data)
apiClient.cancelGig(id, data)

// Rentals
apiClient.createRental(data)
apiClient.getRentals(params)
apiClient.getRentalById(id)
apiClient.bookRental(id, data)
apiClient.startRental(id, data)
apiClient.returnRental(id, data)
apiClient.reportDamage(id, data)

// Payments
apiClient.createPaymentOrder(data)
apiClient.verifyPayment(data)
apiClient.refundPayment(id, data)
apiClient.getPaymentHistory(params)

// Chat
apiClient.createChat(data)
apiClient.getChats()
apiClient.getChatMessages(chatId, params)
apiClient.sendMessage(data)
apiClient.deleteMessage(messageId)

// Ratings
apiClient.createRating(data)
apiClient.getLeaderboard(params)
apiClient.getMyRank()
```

## 🏪 State Management (Zustand)

```typescript
import { useAuthStore } from '@/store/auth'

const { user, token, isAuthenticated, login, logout } = useAuthStore()
```

## 🎣 Custom Hooks

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage'

const { getItem, setItem, removeItem } = useLocalStorage('key')
```

## 🧪 Testing

To test the app:

1. **Register a new account**
   - Visit `/auth/register`
   - Fill in all details
   - Submit

2. **Login**
   - Visit `/auth/login`
   - Use registered email and password
   - Redirected to dashboard

3. **Browse Gigs**
   - Click "Gigs" in navigation
   - Search or filter results
   - Click gig to view details

4. **Post a Gig**
   - From dashboard, click "Post a Gig"
   - Fill gig details
   - Submit (backend required)

5. **Check Leaderboard**
   - Visit `/leaderboard`
   - Toggle between time periods
   - View your rank

## 📦 Dependencies

- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.io-client** - Real-time communication
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **React Query** - Server state
- **Zod** - Validation schemas

## 🔐 Security

- HTTPS ready (configure for production)
- JWT token stored in localStorage
- CORS configured for backend origin
- Input validation with Zod
- XSS protection via Next.js
- CSRF protection ready

## 📱 Responsive Breakpoints

- **Mobile** (< 640px) - Single column, stacked layout
- **Tablet** (640px - 1024px) - 2-column layout
- **Desktop** (> 1024px) - 3-4 column layout

## 🚀 Production Build

```bash
npm run build
npm start
```

## 🐛 Debugging

- Browser DevTools for React components
- Network tab for API calls
- Console for errors
- VS Code with Next.js extension

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Axios Docs](https://axios-http.com/docs/intro)

## 🤝 Contributing

See `/CONTRIBUTING.md` in the root for guidelines.

## 📄 License

MIT License - See LICENSE file in root.

---

**Last Updated**: February 2025
**Status**: Production Ready ✅
