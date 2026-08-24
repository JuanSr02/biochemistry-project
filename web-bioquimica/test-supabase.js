import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from("materias")
    .insert({
      nombre: "Test",
      codigo: "TST-101",
      profesor: "Test",
      cuatrimestre: "1º Cuatrimestre 2026",
      estado: "cursando",
      estudiante_id: "00000000-0000-0000-0000-000000000001" // Invalid user!
    })
    .select()
    .single();

  console.log("Data:", data);
  console.log("Error:", error);
}

test();
