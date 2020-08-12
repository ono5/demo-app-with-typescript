// pathはNodejsをインストールする時についてくるコアモジュール
const path = require('path');

module.exports = {
    // プロジェクト全体のエントリポイント(アプリケーションが最初に起動するところ)
    entry: './src/app.ts',
    output: {
        // webpackがバンドルする名前を指定する
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), // tsconfig.jsonのoutDir設定と同じ場所を指定する 絶対パスを指定する必要がある __dirnameはファイルが設置されているフォルダの絶対パスを取得する
        publicPath: 'dist'
    },
    devtool: 'inline-source-map', // ソースマップの生成
    // javascriptのオブジェクトを取得
    // entryポイントに設定されているファイルから依存関係にあるモジュール情報を全て取得
    module: {
        rules: [
            {
                test: /\.ts$/, // .tsの拡張子に対して、ルールを適用する
                use: 'ts-loader',
                exclude: /node_modules/ // node_modulesは対象外
            }
        ]
    },
    // インポートされたモジュールをどの様に解決するか指定する
    resolve: {
        extensions: ['.ts', '.js'] // ts/jsのファイルを探し出して、最終的に一つのファイルにする
    }
};
