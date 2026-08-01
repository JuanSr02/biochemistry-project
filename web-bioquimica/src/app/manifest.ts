import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BioTools Lab',
    short_name: 'BioTools',
    description: 'Herramientas y utilidades para estudiantes de Bioquímica',
    start_url: '/',
    display: 'standalone', // Esto hace que se vea como app nativa, sin barra de Chrome
    background_color: '#ffffff',
    theme_color: '#0f172a', // Color oscuro elegante (Slate 900)
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  }
}