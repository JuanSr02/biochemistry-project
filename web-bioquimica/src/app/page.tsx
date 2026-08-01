import { redirect } from "next/navigation";

export default function Home() {
  // Más adelante aquí verificaremos si existe una sesión en Supabase
  // Si existe sesión -> redirect('/dashboard')
  // Si no existe -> redirect('/auth/login')
  
  redirect("/auth/login");
}