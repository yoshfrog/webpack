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