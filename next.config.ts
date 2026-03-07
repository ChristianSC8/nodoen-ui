import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/overview",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
