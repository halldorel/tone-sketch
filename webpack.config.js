const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
 
module.exports = {
  mode: 'development',
  plugins: [
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 9898,
      server: { baseDir: ['./sketches'] }
    })
  ]
}