var path = require('path');

module.exports = {
    entry: {
        pxer: './src/pxer/index.tsx',
        pxer_output: './src/output/index.tsx'
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { test: /\.jsx?$/, loader: "babel-loader"},
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ],
            },
            {
                test: /\.scss$/,
                use: [ 'style-loader', 'css-loader', 'sass-loader'],
            }
        ]
    }
}
