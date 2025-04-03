"use client"

import { useState } from "react"
import {Link} from "react-router-dom"
import { Menu, X } from "lucide-react"
import { Button } from "./ui/button"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-primary sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary-foreground flex items-center">
            <span className="mr-2">📍</span>
            AdRoute
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-primary-foreground hover:text-primary-foreground/80 font-medium">
              Home
            </Link>
            <Link to="/plan" className="text-primary-foreground hover:text-primary-foreground/80 font-medium">
              Plan Your Route
            </Link>
            <Link to="#" className="text-primary-foreground hover:text-primary-foreground/80 font-medium">
              About Us
            </Link>
            <Link to="#" className="text-primary-foreground hover:text-primary-foreground/80 font-medium">
              Case Studies
            </Link>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-primary-foreground p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 space-y-3 animate-fade-in">
            <Link
              to="/"
              className="block text-primary-foreground hover:text-primary-foreground/80 py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/plan"
              className="block text-primary-foreground hover:text-primary-foreground/80 py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Plan Your Route
            </Link>
            <Link
              to="#"
              className="block text-primary-foreground hover:text-primary-foreground/80 py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="#"
              className="block text-primary-foreground hover:text-primary-foreground/80 py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Case Studies
            </Link>
            <Button
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
