/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
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
                destination: `${apiBaseUrl}/api/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [{
            protocol: 'http',
            hostname: 'localhost',
            pathname: '**'
        }
        ]
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;