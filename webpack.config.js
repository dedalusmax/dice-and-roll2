const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/game',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.bundle.js',
        publicPath: '/app'
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
        new webpack.DefinePlugin({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true)
        }),
        new webpack.NamedModulesPlugin()
    ]
};