# AHP-GO - 意思決定サポートアプリ

## アプリ概要
AHP-GOは、ユーザーが複数の候補（商品やサービス）を合理的に比較し、最適な選択を支援する意思決定サポートアプリです。
自分の重視する基準（価格・デザイン・ブランドなど）を元に、手軽にAHP(階層分析法)を実施できます。

### 対応する課題とソリューション概要
- 広告なし・シンプルUI・スライダー直感操作
- 通常のECとは異なり「意思決定支援」に特化
- AHPについて理解を深められるAHPアシスタント(AI)付き
- PC・スマホ両対応
  
## サイトイメージ
AHPの一対比較画面のイメージです。
![アプリ画面](/docs/imgPairwise.png)

## サイトURL
[https://ahp-go-app.vercel.app](https://ahp-go-app.vercel.app)
### 以下のユーザでログインして、すぐにチュートリアルを開始できます。
- ユーザID: q1dj1e527m@sute.jp
- PassWord: Test0804

## 使用技術
- フロントエンド：Next.js、React(React HooksまたはContext API)、Tailwind CSS
- バックエンド：Next.js
- データベース：Supabase
- デプロイ：Vercel
- バージョン管理：Git、GitHub
- テスト・デバッグ：DevTools（Safari）
- CI/CD：GitHub Actions（ESLint）
- API: Google Gemini API、Google OAuth、Supabase Auth、Rakuten Developers

## 設計ドキュメント
[要件定義・基本設計・詳細設計の一覧_Googleスプレットシート](https://docs.google.com/spreadsheets/d/1V91GRCaYrSsLrcwU9XdJmRWXALMv9mCTmsPwTVjy8nw/edit?usp=share_link)

詳細設計時のワイヤーフレーム、E-R図、フローチャートの画像はdocsに格納しています。[こちらからアクセス](./docs)

## 機能一覧
- 会員登録・ログイン機能
  - メールアドレス認証
  - Google認証
- AHP実施
  - AHP計算(ウェイトの計算など)
  - CI(首尾一貫性)チェック
- グラフ表示
  - 評価基準の棒グラフ表示
  - 候補の円グラフ表示
- プロジェクト管理
  - 最終目標・評価基準・候補の作成
  - 最終目標・評価基準・候補の編集
  - 最終目標・評価基準・候補の削除
- 商品検索(楽天検索)
- 商品情報要約
- AHPアシスタント(AI質問)

## テスト修正の設計及び実施書
[テスト修正の設計及び実施書_Googleスプレットシート](https://docs.google.com/spreadsheets/d/1l6FGZCC654AA0JGc9Yi5ejwNrD9lYrjsGLORNtGYA0Y/edit?usp=sharing)

## アプリの改善案
[アプリの改善案_Googleスプレットシート](https://docs.google.com/spreadsheets/d/16qADUG1UQzAl7P2zXhYDQ3DoNlDcob7yfZ9y_fcZJjk/edit?usp=sharing)

## 備考
[ESLintの実行結果_GitHub_Actions](https://github.com/satoshi-taneda/AHP-GO-App/actions/runs/18967191091/job/54166243010)

活用した生成AIとその用途
- ChatGPT: 要件定義、設計、各種リサーチ
- v0: アプリのモック作成
- GitHub Copilot Chat：ローカル環境でのコードの修正相談

## リファクタリングの規則
-  2つ以上のファイルで使う、行数が10以上のUIコンポーネントはcomponentsディレクトリに移行
-  2つ以上のファイルで使う、行数が10以上の関数はlibディレクトリに移行
-  変数名で2つ以上の単語が入る場合は、「isPublished」のように二つ目以降の単語の頭を大文字にする
