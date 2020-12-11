//const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const getPath = (pathToFile) => path.resolve(__dirname, pathToFile);
const nodeExternals = require('webpack-node-externals');

module.exports = {    
    devtool: 'source-map', // for debug purposes on production
//    entry: path.resolve('src', 'index.js'),
  externals: [nodeExternals()],
  entry: [
    'babel-polyfill',
    path.resolve('src', 'index.js')
  ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'convoworks.js',
        library: '[name]',
//        libraryTarget: 'umd',
        chunkFilename: '[name].js',
          libraryExport: 'default',
          libraryTarget: 'umd', // you can use libraries everywhere, e.g requirejs, node 
          umdNamedDefine: true,
      },
    optimization : {
        splitChunks: {
        cacheGroups: {
            vendor: {
                test: /node_modules/,
                chunks: 'initial',
                name: 'vendor'
            },
        }
    }
    },
    module: {
        rules: [
            { 
                test: /\.(js|jsx)$/, 
                exclude: /node_modules/, 
                use: {
                    loader: 'babel-loader'}},
                { test: /\.html$/, exclude: /node_modules/, loader: 'html-loader' },
                { 
                    test: /\.css$/, 
                    loader: [ 'style-loader', 'css-loader'],
                },
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
                    loader: 'url-loader?limit=10000&minetype=application/font-woff',
                },
                {
                    test: /\.(ttf|eot|svg|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: 'file-loader',
                },
                { 
                    test: /\.scss$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
                { 
                    test: /\.svg$/,
                    use: ['svg-inline-loader'],
                }
        ]
    },
    plugins: [
//        new HtmlWebPackPlugin({
//            template: 'src/index.html',
//            filename: './index.html'
//        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new webpack.DefinePlugin({
            ON_TEST: process.env.NODE_ENV === 'test'
        })
    ]
};