'use client'

import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Vubble</h3>
            <p className="text-gray-500 text-sm">Your campus marketplace for gigs, rentals, and services.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/gigs" className="hover:text-white transition">Find Gigs</Link></li>
              <li><Link href="/rentals" className="hover:text-white transition">Browse Rentals</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white transition">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© 2025 Vubble. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-white transition"><Twitter size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-white transition"><Linkedin size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-white transition"><Github size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
