const path = require('path');        // 絶対パス記述用（ローカルのフォルダ参照は絶対パス）
const webpack = require('webpack');  // 共通モジュール化
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');  //CSSファイル分離
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");  //不要に出力されるjs制御
const CopyPlugin = require('copy-webpack-plugin');                  //画像コピー
const ImageminPlugin = require('imagemin-webpack-plugin').default;  //画像圧縮
const ImageminMozjpeg = require('imagemin-mozjpeg');                //画像圧縮

const outputDir = 'public';    //出力先ディレクトリ名

module.exports = ({outputFile, assetFile, htmlMinifyOption}) => ({   //webpack.dev/prod.jsからoutputFileで受け取る
  entry: {
    index: './src/js/index.js',
    about: './src/js/about.js',
    // sub:   ['./src/js/sub.js', './src/js/app.js'],
    // app:   './src/scss/app.scss',              //jsでscssをimportする場合は記載不要
    // style: './src/scss/style.scss'             //jsでscssをimportする場合は記載不要
  },

  output: {
    path: path.resolve(__dirname, `${outputDir}`),  //出力先ディレクトリ
    filename: `js/${outputFile}.js`,                //出力後のファイル名
    chunkFilename: `js/${outputFile}.js`,           //splitChunks用のファイル名
  },

  module: {
    rules: [
      { //esLint
        enforce: 'pre',          //優先的に処理を行う
        test: /\.js$/,
        exclude: /node_modules/, //babelの対象外にするフォルダ
        loader: 'eslint-loader',
        options: {
          fix: true              //eslint redommended でfixできるものを自動でfix
        }
      },
      { //JS
        test: /\.js$/,
        exclude: /node_modules/, //babelの対象外にするフォルダ
        loader: 'babel-loader',
      },
      { //SCSS
        test: /\.scss$/,
        // use:下に書かれたものから処理が走る
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,  //CSSファイルを分離 これを使用の場合はstyle-loaderは不要
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      // { //画像類  ※scssにパスのある画像がバンドルされないので使用中止
      //   test: /\.(jpe?g|gif|png|svg|woff2?|ttf|eot)$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: `${assetFile}.[ext]`,             // 出力後のファイル名.拡張子
      //         outputPath: 'images',                   // バンドル後の出力先
      //         // publicPath: 'http://xxxxx/images'    // 商用の絶対パスが必要な場合（画像は別サーバー等）
      //       }
      //     }
      //   ]
      // },
      { //HTML  ->  HtmlWebpackPluginのtemplateでファイルを読み込んでいないと利用できないので注意
        test: /\.html$/,
        use: ['html-loader']
      }
    ]
  },
  //プラグイン
  plugins: [
    //不要jsファイル排出制御
    new FixStyleOnlyEntriesPlugin(),
    //CSSファイル分離
    new MiniCssExtractPlugin({
      filename: `css/${outputFile}.css`,            //出力後のファイル名
    }),
    //指定のモジュールをimport不要で全体で使用可能にする
    new webpack.ProvidePlugin({
      jQuery: 'jquery',       //jQuery をjqueryの変数として使用許可
      $: 'jquery',            //$ をjqueryの変数として使用許可
      //src/utils内に登録した共通モジュールをutilsという変数として登録
      //ProvidePluginとES６で導入されるモジュールを合わせて使う場合は配列
      //呼び出す時は変数とexport default内に設定した関数  ex) utils.log();
      utils: [path.resolve(__dirname, 'src/js/utils'), 'default']   //default -> export defaultのこと
    }),

    //依存関係にあるものまでは読み込まないため、必要な場合はbeta版をインストールする
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      // scriptたタグを挿入する場所
      inject: 'body',            // body or head
      // 挿入したいスクリプト
      chunks: ['index'],         //entryのKey名
      minify: htmlMinifyOption  //Minify化
    }),
    new HtmlWebpackPlugin({
      template: './src/about.html',
      filename: 'about.html',
      // scriptたタグを挿入する場所
      inject: 'body',            // body or head
      // 挿入したいスクリプト
      chunks: ['about'],          //entryのKey名
      minify: htmlMinifyOption  //Minify化
    }),

    //画像 コピー
    new CopyPlugin([
      { from: 'src/images', to: 'images' },
    ]),
    //画像 圧縮
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
      pngquant: {
        quality: '65-80'
      },
      gifsicle: {
        interlaced: false,
        optimizationLevel: 1,
        colors: 256
      },
      svgo: {
      },
      plugins: [
        ImageminMozjpeg({
          quality: 85,
          progressive: true
        })
      ]
    })

  ],
  optimization: {
    //ライブラリなどの複数のjsファイル内に重複した内容を抽出し、別ファイルとして取り出す
    splitChunks: {
      chunks: 'all',    //async: ダイナミックインポートだけchunkを分ける   all:全部chunk対象  initial 同期的に読み込むものだけバンドル
      minSize: 0,       //最低限分割するファイルサイズ 単位：10000 = 1kb
      //cacheGroupsのプロパティ毎に分離処理
      cacheGroups: {
        //3rdパーティのライブラリ用 jQueryなど
        vendors: {
          name: "vendors",         //vendors.jsという名前でバンドルさせる
          test: /node_modules/,    //ファイルを分割するディレクトリを指定
          priority: -10            //設定値に一致した段階でバンドルされる
        },
        //独自の共通項目用
        utils: {                   //eslintrc でglobalに登録
          name: "utils",           //utils.jsという名前でバンドルさせる
          test: /src[\\/]js/,      //ファイルを分割するディレクトリを指定
          chunks: "async"
        },
        default: false             //default方式の分割はさせない
      }
    }
  },
  //パスを設定
  resolve: {
    //特定の文字列にパスを紐付ける
    alias: {  //画像パスをルートからにしたい時は使えない
      '@scss': path.resolve(__dirname, 'src/scss'),   //js内で呼び出す時 import '@scss/style';
      '@img': path.resolve(__dirname, 'src/images')   //scss内で呼び出す時  ~@img/xxx.png  or ~images/xxx.png
    },
    //拡張子を省略する
    extensions: ['.js','.scss'],   //js内で呼び出す時 import '@scss/style';
    //srcフォルダがnode_modulesに格納されているモジュールということ
    modules: [path.resolve(__dirname, 'src'), 'node_modules']  //js内で呼び出す時 import 'js/app';
  }
});



