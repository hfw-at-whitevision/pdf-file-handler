
/** @type {import('next').NextConfig} */
const path = require('path')
const nextConfig = {
    reactStrictMode: false,
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        outputFileTracingIgnores: ["**canvas**"],
    },
}

module.exports = nextConfig