const path = require('path');

module.exports = {
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'svg', 'PNG'],  
    extraNodeModules: {
      crypto: path.resolve(__dirname, 'node_modules/react-native-crypto'),
      stream: require.resolve('stream-browserify'),
      
    },
  },
};

