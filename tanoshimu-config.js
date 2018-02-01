module.exports = {
    defaultVideoPath: "./assets/anime-404-not-found.mp4",
    defaultImagePath: "./assets/anime-404-not-found.jpg",
    server_type: process.env.TANOSHIMU_SERVER_TYPE || 'inline',
    tanoshimu_ssl_directory: process.env.TANOSHIMU_SSL_DIRECTORY || '/etc/letsencrypt/live/tanoshimu.akinyele.ca/',
    enable_ssl: (process.env.TANOSHIMU_ENABLE_SSL || 'false') == 'true',
    enable_ssl_redirect: (process.env.TANOSHIMU_ENABLE_SSL_REDIRECT || 'false') == 'true',
    http_port: process.env.TANOSHIMU_HTTP_PORT || 3000,
    defaultPath: process.env.TANOSHIMU_PATH || '/videos'
}
