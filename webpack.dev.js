const webpackMerge = require('webpack-merge');   //webpackの設定ファイルをマージ
const commonConf = require('./webpack.common');  //マージするconfig共通ファイル
const outputFile = '[name]';     //出力後のファイル名
const assetFile = '[name]';      //画像ファイル
const htmlMinifyOption = false;  //Minify化

const outputDir = 'public';      //出力先ディレクトリ名

module.exports = () => webpackMerge(commonConf({outputFile, assetFile, htmlMinifyOption}), {

  mode: 'development',
  devtool: 'source-map',
  //ローカルサーバー
  devServer: {
      open: true,                       //自動起動
      contentBase: `./${outputDir}`,    //出力先ディレクトリ
      port: 7000,                       //ポート番号
      watchOptions: {
        ignored: /node_modules/        //指定フォルダ配下は無視
      },
  },
});



