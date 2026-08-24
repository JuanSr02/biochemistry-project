import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const userId = "00000000-0000-0000-0000-000000000001";
  
  // Create user
  await supabase.from("usuarios").insert({
    id: userId,
    email: "test@test.com",
    nombre_completo: "Test User",
    rol: "estudiante"
  });

  // Insert materia
  const { data: insData, error: insError } = await supabase
    .from("materias")
    .insert({
      nombre: "Test",
      codigo: "TST-102",
      profesor: "Test",
      cuatrimestre: "1º Cuatrimestre 2026",
      estado: "cursando",
      estudiante_id: userId
    })
    .select()
    .single();

  console.log("Insert Data:", insData);
  console.log("Insert Error:", insError);

  // Get materias
  const { data: selData, error: selError } = await supabase
    .from("materias")
    .select("*")
    .eq("estudiante_id", userId);

  console.log("Select Data:", selData);
  console.log("Select Error:", selError);
}

test();
