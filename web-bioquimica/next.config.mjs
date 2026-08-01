import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // La desactiva en local para que no moleste el caché mientras programas
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aquí iría tu configuración normal de Next.js si tuvieras alguna
  turbopack: {}
};

export default withPWA(nextConfig);