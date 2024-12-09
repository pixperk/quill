import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images : {
    domains : ['lh3.googleusercontent.com']
},
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
};

export default nextConfig;
