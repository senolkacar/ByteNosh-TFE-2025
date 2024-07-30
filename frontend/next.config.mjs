/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback ={
                ...config.resolve.fallback,
                'child_process': false,
                'fs': false,
                'net': false,
                'tls': false,
                'dns':false,
            };
        }
        return config;
    },
    async rewrites() {
        return [
            {
                source: '/api/auth/:path*',
                destination: '/api/auth/:path*',
            },
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*',
            },
        ];
    },
    images: {
        domains: ['localhost'],
    },
};

export default nextConfig;