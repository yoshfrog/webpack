const TerserPlugin = require('terser-webpack-plugin');                    //Minify化
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');  //Minify化（JS用）
const webpackMerge = require('webpack-merge');    //webpackの設定ファイルをマージ
const commonConf = require('./webpack.common');   //マージするconfig共通ファイル
const outputFile = '[name].[chunkhash]';   //出力後のファイル名
const assetFile = '[contenthash]';         //画像ファイル
const htmlMinifyOption = {           //Minify化
    collapseWhitespace: true,        //空白削除
    removeComments: true,            //コメント削除
    removeRedundantAttributes: true, //不要アトリビュート削除
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true
};  


module.exports = () => webpackMerge(commonConf({outputFile, assetFile, htmlMinifyOption}), {

  mode: 'production',

  // Minify化設定
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new OptimizeCssPlugin()
    ]
  }
});



