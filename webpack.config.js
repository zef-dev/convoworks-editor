//const HtmlWebPackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    devtool: 'source-map', // for debug purposes on production
    //    entry: path.resolve('src', 'index.js'),
    externals: [nodeExternals()],
    entry: [
        path.resolve('src', 'index.js')
    ],
    watchOptions: {
        aggregateTimeout: 200,
        poll: 1000,
        ignored: 'node_modules/**'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'convoworks.js',
        library: '[name]',
        libraryExport: 'default',
        libraryTarget: 'umd', // you can use libraries everywhere, e.g requirejs, node
        umdNamedDefine: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env']
                    }
                }
            },
            { test: /\.html$/, exclude: /node_modules/, loader: 'html-loader' },
            {
                test: /\.css$/, exclude: /node_modules/,
                loader: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(ttf|eot|svg|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/, exclude: /node_modules/,
                loader: 'url-loader',
            },
            {
                test: /\.scss$/, exclude: /node_modules/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.svg$/, exclude: /node_modules/,
                use: ['svg-inline-loader'],
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            ON_TEST: process.env.NODE_ENV === 'test'
        })
    ]
};
