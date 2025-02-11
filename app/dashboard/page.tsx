"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface Todo {
  id: number
  task: string
  is_complete: boolean
}

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
      } else {
        setUser(user)
        fetchTodos()
      }
    }
    checkUser()
  }, [router])

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("todos").select("*").order("id", { ascending: true })
    if (error) console.error("Error fetching todos:", error)
    else setTodos(data || [])
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    const { data, error } = await supabase
      .from("todos")
      .insert([{ task: newTodo, user_id: user.id }])
      .select()
    if (error) console.error("Error adding todo:", error)
    else {
      setTodos([...todos, data[0]])
      setNewTodo("")
    }
  }

  const toggleTodo = async (id: number, is_complete: boolean) => {
    const { error } = await supabase.from("todos").update({ is_complete: !is_complete }).eq("id", id)
    if (error) console.error("Error updating todo:", error)
    else {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, is_complete: !is_complete } : todo)))
    }
  }

  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", id)
    if (error) console.error("Error deleting todo:", error)
    else {
      setTodos(todos.filter((todo) => todo.id !== id))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      <form onSubmit={addTodo} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo"
          />
          <Button type="submit">Add</Button>
        </div>
      </form>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-2 bg-gray-100 p-2 rounded">
            <Checkbox checked={todo.is_complete} onCheckedChange={() => toggleTodo(todo.id, todo.is_complete)} />
            <span className={todo.is_complete ? "line-through" : ""}>{todo.task}</span>
            <Button onClick={() => deleteTodo(todo.id)} variant="destructive" size="sm">
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

