export function runServer() {
    var host = process.env.HOST || 'localhost';
    // Listen on a specific port via the PORT environment variable
    var port = process.env.PORT || 8082;
    
    var cors_proxy = require('cors-anywhere');
    cors_proxy.createServer({
        originWhitelist: [], // Allow all origins
        requireHeader: ['Origin', 'X-requested-with'],
        removeHeaders: ['cookie', 'cookie2']
    }).listen(port, host, function() {
        console.log('Running CORS Anywhere on ' + host + ':' + port);
    });
}

