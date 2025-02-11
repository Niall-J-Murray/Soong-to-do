"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      router.push("/login")
    } catch (error) {
      console.error("Error during registration:", error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="mb-4 text-2xl font-bold">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

