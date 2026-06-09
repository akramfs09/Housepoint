module.exports = {
    apps: [
        {
            name: 'housepoint-reverb',
            script: 'cmd.exe',
            args: '/c "C:\\laragon\\bin\\php\\php-8.3.27-nts-Win32-vs16-x64\\php.exe artisan reverb:start"',
            cwd: 'C:\\laragon\\www\\housepoint',
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
        },
        {
            name: 'housepoint-queue',
            script: 'cmd.exe',
            args: '/c "C:\\laragon\\bin\\php\\php-8.3.27-nts-Win32-vs16-x64\\php.exe artisan queue:work --sleep=3 --tries=3"',
            cwd: 'C:\\laragon\\www\\housepoint',
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
        },
    ],
};