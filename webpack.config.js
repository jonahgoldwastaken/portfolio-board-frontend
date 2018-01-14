const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry: path.resolve(__dirname, 'src/app.js'),
    devtool: 'source-maps',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'app.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        targets: {
                                            browsers: [
                                                'last 2 versions',
                                                'ie >= 11'
                                            ]
                                        }
                                    }
                                ]
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.css/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/components/drag-drop/drag-drop.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'login/index.html',
            template: 'src/components/login/login.html'
        }),
        new ExtractTextPlugin('app.css')
    ]
}