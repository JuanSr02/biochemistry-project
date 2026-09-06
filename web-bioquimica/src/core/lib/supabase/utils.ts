export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    Boolean(url) &&
    Boolean(key) &&
    url !== "https://tu-proyecto.supabase.co" &&
    url !== "https://placeholder-project.supabase.co" &&
    key !== "tu-anon-key-de-supabase" &&
    key !== "placeholder-anon-key"
  );
}
