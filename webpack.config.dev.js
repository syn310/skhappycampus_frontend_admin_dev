const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
    mode: "development",
    entry: {
      index: ['@babel/polyfill','./src/index.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),/** bundle.js와 index.html이 저장될 위치 */
        chunkFilename: '[name].[chunkhash].bundle.js',
        filename: '[name].[chunkhash].bundle.js',
    },
    devServer: {
        inline: true,
        port: 9999,
        contentBase: __dirname + '/dist/',
        proxy: {
          '/nice': {
            target: 'http://192.168.0.13:8081', //nice
                secure: false,
                changeOrigin: true,
           },
          '/': {
              target: 'http://192.168.0.13:3008', //api
                  secure: false,
                  changeOrigin: true,
          }

        }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          }
        },
        {
            test: /\.html$/,
            loader: "html-loader"
        },
        {
            test: /\.(css|less)$/,
            use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(jpg|png|gif|jpeg|woff|woff2|eot|ttf|svg|ico)$/,
          use: [
              {
                  loader: 'url-loader',
              },
          ]
        },
        {
          test: /\.(png|jpg|gif|svg|eot|woff|woff2|ttf)$/,
          include: path.join(__dirname, 'dist'),
          use: [
            {
              loader: 'file-loader',
              options: {
                limit: 10000,
                name: 'static/[name].[hash:8].[ext]',
              },
            }
          ]
        },
        
      ]
    },
    plugins: [
        /** template을 filename에 그대로 복사함. */
        new htmlWebpackPlugin({
          chunks: ["index","images","vendors"],
            template: path.join(__dirname, './public/index.html'),
            inject: true, //true or body로 설정하면 body 태그의 맨 마지막에 bundle.js import
            filename: path.join(__dirname, './dist/index.html')
        }),
        new ManifestPlugin({
          fileName: 'assets.json',
          basePath: '/'
        }),
    ],
    optimization: {
      /** 번들 쪼개기 설정 */
      splitChunks: {
        /** 한 bundle당 최대 사이즈(byte단위) */
        // maxSize: 300000, //300kb, 약 292kib
        cacheGroups: {
          /** node_modules 폴더를 vendors.bundle.js로 만듬 */
          node_vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          /** public 폴더를 images.bundle.js로 만듬 */
          public_images: {
            test: /[\\/]public[\\/]/,
            name: 'images',
            chunks: 'all'
          },
        }
      }
    },
    resolve: {
      extensions: ['.js', '.jsx', '.css'],
    },

};
