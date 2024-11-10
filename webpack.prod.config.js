const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/game',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app/app.bundle.js',
        publicPath: '/dist'
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
            {
                test: /\.(tsx?)|(js)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: [/\.vert$/, /\.frag$/],
                use: 'raw-loader'
            }
        ]
    },

    plugins: [
        new CopyPlugin([
            { from: 'styles', to: 'styles' },
            { from: 'assets', to: 'assets' },
            { from: 'data', to: 'data' },
            { from: 'index.html', to: 'index.html', toType: 'file'},
          ]),
        new webpack.DefinePlugin({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true)
        }),
        new UglifyJsPlugin()
    ]
};