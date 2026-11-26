import type { NextConfig } from "next";

const supabaseUrl = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : undefined;
  } catch {
    return undefined;
  }
})();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `npm run dev` solo sirve los scripts a localhost. Esto permite abrir el sitio desde otros
  // dispositivos de tu red (p. ej. http://192.168.1.54:3000) sin que se rompan las animaciones.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*", "*.local"],
  poweredByHeader: false,
  images: {
    // Solo para Supabase local (supabase start → 127.0.0.1:54321). En producción el host es público.
    dangerouslyAllowLocalIP: ["localhost", "127.0.0.1"].includes(supabaseUrl?.hostname ?? ""),
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: supabaseUrl?.protocol === "http:" ? "http" : "https",
        hostname: supabaseUrl?.hostname ?? "*.supabase.co",
        ...(supabaseUrl?.port ? { port: supabaseUrl.port } : {}),
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@react-three/drei", "framer-motion"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
