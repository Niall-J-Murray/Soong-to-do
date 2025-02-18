"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Todo {
  id: number;
  task: string;
  is_complete: boolean;
}

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        fetchTodos();
      }
    };
    checkUser();
  }, [router]);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error("Error fetching todos:", error);
    else setTodos(data || []);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const { data, error } = await supabase
      .from("todos")
      .insert([{ task: newTodo, user_id: user.id }])
      .select();
    if (error) console.error("Error adding todo:", error);
    else {
      setTodos([...todos, data[0]]);
      setNewTodo("");
    }
  };

  const toggleTodo = async (id: number, is_complete: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ is_complete: !is_complete })
      .eq("id", id);
    if (error) console.error("Error updating todo:", error);
    else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, is_complete: !is_complete } : todo
        )
      );
    }
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) console.error("Error deleting todo:", error);
    else {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo.id);
    setEditingText(todo.task);
  };

  const saveEdit = async (id: number) => {
    if (!editingText.trim()) return;
    const { error } = await supabase
      .from("todos")
      .update({ task: editingText })
      .eq("id", id);
    if (error) console.error("Error updating todo:", error);
    else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, task: editingText } : todo
        )
      );
      setEditingTodo(null);
      setEditingText("");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-600 mb-1">
            Welcome, {user?.email?.split("@")[0] || "User"}
          </p>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      <form onSubmit={addTodo} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new to-do"
          />
          <Button type="submit">Add</Button>
        </div>
      </form>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-2 bg-gray-100 p-2 rounded"
          >
            <Checkbox
              checked={todo.is_complete}
              onCheckedChange={() => toggleTodo(todo.id, todo.is_complete)}
            />
            {editingTodo === todo.id ? (
              <div className="flex gap-2 flex-1">
                <Input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(todo.id)}
                  autoFocus
                />
                <Button onClick={() => saveEdit(todo.id)} size="sm">
                  Save
                </Button>
                <Button
                  onClick={() => setEditingTodo(null)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <span
                  className={`flex-1 ${todo.is_complete ? "line-through" : ""}`}
                >
                  {todo.task}
                </span>
                <Button
                  onClick={() => startEditing(todo)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  size="sm"
                >
                  Delete
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
