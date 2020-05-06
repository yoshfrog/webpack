# Webpack 4

#### 事前準備
yarnのグローバルインストール<br>
```npm install -g yarn```<br>

## 環境作成手順
1. ターミナルで作業フォルダに移動<br>
2. パッケージの初期化<br>
   ```yarn init -y``` : package.json生成<br>
3. webpack, webpack-cli をインストール <br>
   -> node_modules、yarn.lock 生成<br><br>
  ＜ローカルパッケージとして追加＞<br>
  ```yarn add --dev webpack webpack-cli```<br><br>

4. バンドル用のフォルダ/ファイルを作成<br>
   `src` フォルダ内にindex.html等を作成<br>

5. ローカル環境直下にバンドル設定ファイルを作成する<br>
  ＜共通設定＞<br>
  webpack.common.js<br>
  ＜開発環境用＞<br>
  webpack.dev.js<br>
  ＜商用環境用＞<br>
  webpack.prod.js<br><br>

  #### 主な記載内容
  モード
  ```
  mode: 'development',   //開発用 development   商用 production
  ```
  開発ツール
  ```
  devtool: 'source-map', //none なし、 source-map ソースマップ
  ```

  エントリーポイント
  ```
  // 1つのjsファイルにバンドルしたい場合 （js内でimport（scss含む）依存関係がある場合）
  entry: './src/index.js,

  // 1つのjsファイルにバンドルしたい場合 （js内でimport（scss含む）依存関係がない場合は配列で指定）
  entry: ['./src/index.js', './src/app.js'],

  // ファイルを分けてバンドルしたい場合 keyにバンドル後のファイル名
  entry: {
    index: './src/index.js',
    app:   './src/app.js'
  },

  // ファイルを分けて、依存関係あるファイルをまとめたい場合
  entry: {
    index: './src/index.js',
    sub:   ['./src/sub.js', './src/app.js']
  },
  ```
  出力先<br>
  出力先のフォルダ名、ファイル名を設定  初期値は distフォルダにmain.js
  ```
  // エントリーポイントでファイル名を指定していない場合ファイル名入力
  output: {
    path: path.resolve(__dirname, 'ディレクトリ名'),
    filename: 'ファイル名.js'
  },

  // エントリーポイントにオブジェクトでファイル名を指定する場合は[name]変数を追加
  // nameにオブジェクトのkeyが代入される
  output: {
    path: path.resolve(__dirname, 'ディレクトリ名'),
    filename: '[name].js'
  },
  ```

### ハッシュ
バンドル時に生成される命名規則<Br>
`[name]`: ファイル名<Br>
`[hash]`: ビルド番号<Br>
`[contenthash]`: 生成されたファイルごと<Br>
`[chunkhash]`: 生成されたファイルごとchunkt単位<Br>


## Loader
インストールコマンド<br>
`yarn add --dev ローダー名 ローダー名`

### SASS
1. SASSモジュール、ローダーインストール

- sass
- sass-loader    -> scss を css に変換
- css-loader
- style-loader   -> css情報をhtmlにstyleタグで出力する
- postcss-loader -> `postcss.config.js`に設定内容記載
- autoprefixer   -> prefixer用

2. `postcss.config.js`をローカル直下に作成
```
module.exports = {
  plugins: [
    require('autoprefixer')
  ]
}
```

3. scssファイルimport<br>
読み込ませたいJSファイルにてimport（複数記載可）<br>
`import './style.scss';`<br>
`import './app.scss';`<br>
※JSでscssをimportしない場合は、scss独立でバンドルできるが、htmlファイルに自動でlinkタグの挿入はできないので、各htmlファイルに手動でlinkタグを挿入しなければいけない


### CSSファイル分離
プラグインインストール
- mini-css-extract-plugin        -> CSS分離するプラグイン
- webpack-fix-style-only-entries -> entryにscssを追記することで新たに不要にバインドされるjsを制御するプラグイン

### HTML プラグイン
プラグインインストール
- html-webpack-plugin       -> HTMLをコピー、scriptタグ、jsファイル名を出力
- html-webpack-plugin@next  -> ベータ版　上記プラス、JSでimportしているscssもlinkタグ、cssファイル名で出力

※JSの中で依存関係にあるimportのjs/scss等までは検知できないため、バインドされないファイルが発生する<br>
依存関係にあるファイルもバンドルするためにはベータ版をインストールする


### HTML ローダー
ローダーインストール
- html-loader<br>
imgタグの画像パスをバンドル<br>
`HtmlWebpackPlugin`のtemplateでファイルを読み込んでいないと利用できないので注意

### 画像
ローダーインストール
- file-loader<br>
`html-loader`でimgタグを読み込み、`file-loader`でファイル名を生成する<br>
*なぜか画像はバンドルできなかったので、後述のコピープラグイン使用に方針変更*

### 画像
プラグインインストール
- copy-webpack-plugin      -> 画像コピー
- imagemin-webpack-plugin  -> 画像圧縮
- imagemin-mozjpeg         -> 画像圧縮

## Bable
モジュールインストール
- babel-loader          -> babel本体のcoreファイルを呼び出す
- @babel/core           -> coreファイルをインストール
- @babel/preset-env     -> これも必要
- core-js@3             -> ver.3  古いブラウザが保持していない機能を補完する
- regenerator-runtime   -> async-awaitなど古いブラウザが保持していない機能を補完する jsファイル内にimport必要

Babel本体の設定ファイル作成<br>
`babel.config.js`をローカル直下に作成
```
module.exports = api => {
  api.cache(true);      //buildの時間短縮

  return {
    "presets": [
      ["@babel/preset-env", {
        //ターゲットブラウザ
        targets: [
          "last 2 version",
          "> 1%",
          "maintained node versions",
          "not dead"
        ],
        // 必要な機能をjsが解析し追加してくれる
        useBuiltIns: "usage",
        corejs: 3   //core-jsのバージョン
      }]
    ]
  }
}
```


### Pollyfil
古いバージョンではpollyfil必要だった<br>
babel 7.4以降はpollyfil非推奨<br>





## ESLint
インストール
- eslint
- eslint-loader
- babel-eslint


設定ファイル作成<br>
`.eslintrc`をローカル直下に作成

```
{
  "env": {
    "browser": true,   //ブラウザ上で利用するJSということ -> console.logエラー回避
    "es2017": true     //ES8
  },
  "extends": "eslint:recommended",  //eslintの推奨条件で反映される
  "parser": "babel-eslint",
  "parserOptions": {
    // "ecmaVersion": 2017,        //env で指定してあれば記述不要
    "sourceType": "module"         //module単位(ES6)で管理  default はscript
  },
  //globalの値を渡す
  "globals": {
    "utils" : "readonly",
    // jQueryがグローバルに存在することを示す
    "jQuery": "readonly",          // readonly 変更不可  writable 可変
    // $がグローバルに存在することを示す
    "$" : "readonly"
  },
  "rules": {
    "no-undef": "error",           // 宣言していない定数/変数があればエラー
    "semi": ["error", "always"]    //常に文末にセミコロン、なければエラー
  }
}
```
`browser`<br>
グローバルオブジェクトが存在する前提でチェックが行われる<br>
ブラウザでJSを使う場合、windowオブジェクトがグローバルオブジェクトになる

`"eslint:recommended"`<br>
https://eslint.org/docs/rules/<br>
✔︎：redommendedで管理されるもの、レンチマーク：fixオプションをつけると自動で修正してくれる

`jQuery`<br>
グローバルオブジェクト内にjQueryがあって、それをモジュールの中で使っている場合には、eslintの中ではわからないので
jQueryがグローバルに存在することを示す

`rules`<br>
`"extends": "eslint:recommended"`で管理されないものを個別に指定<br>
`"omitLastInOneLineBlock": true`  1行のラインブロックの最後のセミコロンはチェックしない<br>
（`eslint-loader`にfixオプションが記載されていたら不要）<br>
```
//常に文末にセミコロン、なければエラー, {1行のラインブロックの最後のセミコロンはチェックしない}
"semi": ["error", "always", {"omitLastInOneLineBlock": true}]
```



### 共通モジュール化
指定のモジュールをimport不要で全体で使用可能にする<br>

インストール
- webpack
- jquery

`.eslintrc`に設定を追加
```
"globals": {
  （中略）
  // jQueryがグローバルに存在することを示す
  "jQuery": "readonly",         // readonly 変更不可  writable 可変
  // $がグローバルに存在することを示す
  "$" : "readonly"
},
```

### splitChunks
ファイルを適切なサイズに分割してサイトのパフォーマンスをあげる<br>
複数のjsファイル内に重複した内容を抽出し、別ファイルとして取り出す<br>

`vendors`:3rdパーティーライブラリなどの登録<br>
`utils`:独自の共通項目用<br>
`src/utils`内に登録した共通モジュールを`utils`という変数として登録<br>
`.eslintrc`のglobalにも`utils`を追加しておく
```
"globals": {
  "utils" : "readonly",
  （中略）
},
```

### ダイナミックインポート
非同期でimportするため、パフォーマンスが上がる
`import ('./app/scss);`

#### 普通のインポート
`import './app/scss;`



## 商用/開発環境分け
インストール
- webpack-merge   -> webpackの設定ファイルをマージする<br>

webpack.congig.jsを分離する
- webpack.common.js  -> 共通設定
- webpack.dev.js     -> 開発用
- webpack.prod.js    -> 商用


### 出力先フォルダ配下クリーン
rmコマンドが使えるようになる<br>
インストール
- rimraf


### コマンドを追加
`package.json`にコマンド追加してショートカットが使えるようにする<br>
コマンドは汎用性を重視し、`npm/npx`にしておく
```
"scripts": {
  "clean": "npx rimraf ./public",
  "dev": "npm run webpack:dev && npm run webpack:server",
  "webpack:server": "npx webpack-dev-server --config ./webpack.dev.js",
  "webpack:dev": "npm run clean && webpack --config ./webpack.dev.js",
  "build": "npm run clean && npx webpack --config ./webpack.prod.js"
},
```
`npx`：ローカルパッケージを実行する時<br>
`npm run`<br><br>
この設定で以下コマンドが使えるようになる<br>
- `yarn run dev`     -> 開発用
- `yarn run build`   -> 商用



## 商用環境
インストール<br>
- optimize-css-assets-webpack-plugin    -> Minify化
- terser-webpack-plugin                 -> Minify化（JS用）<br>

`terser-webpack-plugin`はNode.jsのバージョンが10.17以降でないとインストールできない

## 開発環境
インストール<br>
- webpack-dev-server   -> ローカルサーバー



## resolve
パスを設定<br>
ショートカットキーと登録して呼び出しやすくする<br>

### resolve vscodeの補完機能追加
`jsconfig.json`をローカル直下に作成
```
{
  "compilerOptions": {
    "baseUrl": "./src",  //設定をする基準のディレクトリ
    "paths": {
      "@scss": ["./scss"],
      "scss": ["./scss"],
      "js": ["js"],
      "images": ["images"],
    }
  }
}
```

## その他

## jQuery
jQueryを使う場合は、jsファイルでimport
`import jQuery from "jquery";`
関数 `jQuery();`


## module 記述
モジュールのルールを記載
test: 対象のファイル
use: 使用方法  下に記述されているものから実行される

```
module: {
  rules: [
    // ①基本形
    {
      test: /対象ファイル/
      use: [
        'aaa-loader',
        'bbb-loader'
      ]
    },

    // ②loaderが1つの場合
    {
      test: /対象ファイル/
      use: [
        'ccc-loader'
      ]
    },

    // ③use に options を使用する場合 -> use: [ {} ]
    {
      test: /\.(対象ファイル複数の場合)$/,
      use: [
        {
          loader: 'ddd-loader',
          options: {
            name: '[name].[ext]',
          }
        }
      ]
    }

    // ④use を併用して使用する場合 -> use: [ {}, '' ]  fff-loader -> eee-loader の順に実行される
    {
      test: /\.(対象ファイル複数の場合)$/,
      use: [
        {
          loader: 'eee-loader',
          options: {
            name: '[name].[ext]',
          }
        },
        'fff-loader',
      ]
    }

    // ⑤use に loader が1つのみの場合[]省略可 -> use: {}
    {
      test: /\.(対象ファイル複数の場合)$/,
      use: {
        loader: 'ggg-loader',
        options: {
          name: '[name].[ext]',
        }
      }
    }

    // ⑥use に loader が1つのみの場合[],use{}省略可 ->
    {
      test: /\.(対象ファイル複数の場合)$/,
      loader: 'ggg-loader',
      options: {
        name: '[name].[ext]',
      }
    }
  ]
}
```


### JSファイル
importする場合は先頭に記載<br>
読み込みファイルが単独の場合<br>
`import './sub';`  .jsは省略可<br>

読み込みファイルがさらにimportしている場合<br>
`import sub from './sub';`  .jsは省略可<br>

