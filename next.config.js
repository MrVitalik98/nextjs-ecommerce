require('dotenv').config({ path: '.env.local'})
const webpack = require('webpack')

module.exports = {
  images: {
    domains: [
      'res.cloudinary.com',
      'upload.wikimedia.org'
    ]
  },
  future: {
    webpack5: true,
  },
  webpack: config => {
    config.plugins.push(
      new webpack.EnvironmentPlugin(process.env)
    )
    return config
  }
}
