const runtimeCaching = require("next-pwa/cache");

const withPWA = require("next-pwa")({
    dest: "public",
    runtimeCaching,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // pwa: {
    //     dest: "public",
    //     register: true,
    //     skipWaiting: true,
    // },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:3001/:path*",
            },
            // {
            //     source: "/avatar/:path*",
            //     destination: "https://i.pravatar.cc/:path*",
            // },
        ];
    },
};

module.exports = withPWA(nextConfig);
