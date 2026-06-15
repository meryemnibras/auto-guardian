/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a self-contained server bundle (.next/standalone) so the Docker
  // image only needs Node + the traced node_modules — small and fast to boot.
  output: "standalone",
};

export default nextConfig;
