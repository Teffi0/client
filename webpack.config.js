const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    // Добавление полифилла для 'crypto'
    config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
    };

    // Добавление дополнительных правил для обработки JS/JSX и статических файлов
    config.module.rules.push({
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['babel-preset-expo', '@babel/preset-react'],
                plugins: [
                    ["@babel/plugin-transform-private-methods", { "loose": true }],
                    ["@babel/plugin-transform-private-property-in-object", { "loose": true }],
                ],
            }
        }
    });

    config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name: '[name].[hash].[ext]',
                    outputPath: 'assets/',
                },
            },
        ],
    });

    // Помни, что изменение конфигурации Webpack может повлиять на совместимость с Expo.
    // Всегда тестируй изменения в конфигурации, чтобы убедиться, что они работают корректно.

    return config;
};
