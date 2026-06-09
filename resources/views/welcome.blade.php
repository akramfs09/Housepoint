<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HousePoint</title>
    @viteReactRefresh
    @vite('resources/js/main.jsx')
</head>
<body class="antialiased bg-gray-100">
    <div id="root"></div>

    <script src="{{ config('midtrans.is_production') ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js' }}"
            data-client-key="{{ config('midtrans.client_key') }}"></script>
</body>
</html>
