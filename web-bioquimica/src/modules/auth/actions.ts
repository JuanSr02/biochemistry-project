"use server";

import { createClient } from "@/core/lib/supabase/server";
import { isSupabaseConfigured } from "@/core/lib/supabase/utils";
import { cookies } from "next/headers";

export async function iniciarSesion(email: string, password: string) {
  if (!email || !password) {
    return { success: false, error: "Por favor ingresa tu correo electrónico y contraseña." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let mensaje = error.message;
        if (mensaje === "Invalid login credentials") {
          mensaje = "Credenciales inválidas. Verifica tu correo o contraseña.";
        }
        return { success: false, error: mensaje };
      }

      const userEmail = data.user?.email || email;
      const nombre = data.user?.user_metadata?.nombre_completo || userEmail.split("@")[0];

      const userObj = {
        id: data.user?.id || "usr-1",
        email: userEmail,
        nombre: nombre,
      };

      // Guardamos la cookie de la app temporalmente para el modo demo, aunque Supabase ya guardó la suya
      const cookieStore = await cookies();
      cookieStore.set("biotools_session", JSON.stringify(userObj), { 
        maxAge: 60 * 60 * 24 * 30, 
        path: "/",
        sameSite: "lax",
      });

      return {
        success: true,
        user: userObj,
      };
    } catch {
      return { success: false, error: "Error inesperado al iniciar sesión." };
    }
  }

  const prefijo = email.split("@")[0];
  const nombreFormateado = prefijo.charAt(0).toUpperCase() + prefijo.slice(1);

  const userObj = {
    id: "usr-demo",
    email: email.trim(),
    nombre: nombreFormateado,
  };

  const cookieStore = await cookies();
  cookieStore.set("biotools_session", JSON.stringify(userObj), { 
    maxAge: 60 * 60 * 24 * 30, 
    path: "/",
    sameSite: "lax",
  });

  return {
    success: true,
    user: userObj,
  };
}

export async function registrarUsuario(nombre: string, email: string, password: string) {
  if (!nombre.trim() || !email.trim() || !password) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }

  if (password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombre_completo: nombre.trim(),
          },
        },
      });

      if (error) {
        let mensaje = error.message;
        if (mensaje === "User already registered") {
          mensaje = "Este correo electrónico ya está registrado.";
        }
        return { success: false, error: mensaje };
      }

      if (data.user) {
        await supabase.from("usuarios").insert({
          id: data.user.id,
          email: email.trim(),
          nombre_completo: nombre.trim(),
          rol: "estudiante",
        });
      }

      const userObj = {
        id: data.user?.id || "usr-new",
        email: email.trim(),
        nombre: nombre.trim(),
      };

      const cookieStore = await cookies();
      cookieStore.set("biotools_session", JSON.stringify(userObj), { 
        maxAge: 60 * 60 * 24 * 30, 
        path: "/",
        sameSite: "lax",
      });

      return {
        success: true,
        user: userObj,
      };
    } catch {
      return { success: false, error: "Error inesperado al registrar usuario." };
    }
  }

  const userObj = {
    id: `usr-${Date.now()}`,
    email: email.trim(),
    nombre: nombre.trim(),
  };

  const cookieStore = await cookies();
  cookieStore.set("biotools_session", JSON.stringify(userObj), { 
    maxAge: 60 * 60 * 24 * 30, 
    path: "/",
    sameSite: "lax",
  });

  return {
    success: true,
    user: userObj,
  };
}

export async function actualizarPerfil(id: string, nombre: string) {
  if (!nombre.trim()) {
    return { success: false, error: "El nombre es obligatorio." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error: dbError } = await supabase
        .from("usuarios")
        .update({ nombre_completo: nombre.trim() })
        .eq("id", id);
        
      if (dbError) {
        return { success: false, error: dbError.message };
      }
      
      return { success: true };
    } catch {
      return { success: false, error: "Error inesperado." };
    }
  }

  return { success: true };
}

export async function eliminarCuenta(id: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);
        
      if (error) {
         return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch {
      return { success: false, error: "Error inesperado." };
    }
  }

  return { success: true };
}

export async function cerrarSesionAccion() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignorar error
    }
  }
  
  const cookieStore = await cookies();
  cookieStore.delete("biotools_session");
  
  return { success: true };
}
