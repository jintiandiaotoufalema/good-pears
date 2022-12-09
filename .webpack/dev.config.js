// import {Configuration} from 'webpack';
// const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * @type {Configuration}
 */
const config = {
    mode: 'development',
    entry: './index.js',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            // {
            //     test: /\.html$/,
            //     use: [{
            //         loader: 'html-loader',
            //     }]
            // },
            {
                test: /\.scss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                  ]
                },
        ]
    },
    // plugins: [
    //     new HtmlWebpackPlugin({template: './src/index.html'})
    // ],
    output: {
        filename: 'bundle.js',
    },
    devtool: "eval-source-map"
};

module.exports = config;