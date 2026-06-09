module.exports = {
    apps: [
        {
            name: 'housepoint-reverb',
            script: 'php',
            args: 'artisan reverb:start',
            interpreter: 'php',
            cwd: './',
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                APP_ENV: 'production',
            },
        },
        {
            name: 'housepoint-queue',
            script: 'php',
            args: 'artisan queue:work --sleep=3 --tries=3',
            interpreter: 'php',
            cwd: './',
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
        },
    ],
};