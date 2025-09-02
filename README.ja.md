# GPT-OSS フロントエンド

GPT-OSSプロジェクト用のChatGPTクローンWebアプリケーションです。

## 概要

このフロントエンドアプリケーションは、OpenAIのgpt-ossモデルとの対話を可能にする完全なChatGPTクローンです。Ollamaとの統合により、ローカル環境でAIチャットを実行できます。

## 主な機能

### 基本機能
- **チャット機能**: リアルタイムでAIとの会話
- **複数チャット管理**: 複数の会話を同時に管理
- **ストリーミング応答**: サーバーサイドイベント（SSE）によるリアルタイム応答
- **レスポンシブデザイン**: ChatGPTライクなダークテーマUI

### MyGPT機能
- **カスタムGPT作成**: 独自のAIアシスタントを作成
- **GPT管理**: 作成したGPTの編集、削除、管理
- **会話スターター**: 事前定義された質問でチャットを開始
- **GPT切り替え**: デフォルトGPTとカスタムGPT間の切り替え

### マルチモーダル機能
- **ファイルアップロード**: 画像、PDF、Officeドキュメントの対応
- **画像解析**: AIによる画像内容の分析と説明
- **日本語文書処理**: 日本語を含む文書の高精度な解析
- **Officeドキュメント**: Word、Excel、PowerPointファイルの内容抽出

### Markdown & LaTeX表示
- **リッチテキスト**: **太字**、*斜体*の完全対応
- **表組み**: Markdownテーブルの美しい表示
- **数式表示**: KaTeXによるLaTeX数式の完全レンダリング
  - インライン数式: `\( F = ma \)`
  - ブロック数式: `\[ \boxed{ \mathbf{F}_{\text{net}} = m \mathbf{a} } \]`
- **水平線**: `---` による区切り線

### 日本語対応
- **IME入力**: 日本語変換中の誤送信防止
- **文字認識**: 画像内日本語テキストの高精度認識
- **多言語サポート**: 日本語を含む多言語での対話

## 技術スタック

- **Next.js 15**: React 19ベースのモダンWebフレームワーク
- **TypeScript**: 型安全な開発環境
- **Tailwind CSS**: カスタムCSS実装によるスタイリング
- **KaTeX**: 数学記法の美しいレンダリング
- **Heroicons**: アイコンライブラリ

## API統合

- **Ollama**: OpenAI互換APIエンドポイント経由
- **ローカルストレージ**: チャット履歴とGPT設定の永続化
- **ストリーミング**: リアルタイム応答表示
- **エラーハンドリング**: 堅牢なエラー処理機能

## セットアップ

### 前提条件
- Node.js 18以上
- Ollama（ローカルでAIモデルを実行するため）

### インストール

```bash
cd frontend
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてアプリケーションにアクセスします。

### Ollamaセットアップ

1. [Ollama](https://ollama.com/download)をインストール
2. GPT-OSSモデルをプル:
```bash
ollama pull gpt-oss:20b
# または
ollama pull gpt-oss:120b
```

## 使い方

### 基本チャット
1. 「Start a new chat」をクリック
2. メッセージを入力して送信
3. AIからのストリーミング応答を確認

### MyGPT作成
1. サイドバーの「MyGPTs」をクリック
2. 「Create a GPT」で新しいGPTを作成
3. 名前、説明、指示、会話スターターを設定
4. 「Start Chat」でそのGPTとの会話を開始

### ファイルアップロード
1. チャット入力欄のクリップアイコンをクリック
2. ファイルを選択（画像、PDF、Office文書対応）
3. メッセージと一緒に送信
4. AIがファイル内容を解析して応答

### LaTeX数式入力
- インライン: `\( E = mc^2 \)`
- ブロック: `\[ \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi} \]`

## プロジェクト構造

```
frontend/
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # Reactコンポーネント
│   ├── lib/          # API関数とユーティリティ
│   └── types/        # TypeScript型定義
├── public/           # 静的ファイル
└── package.json      # 依存関係とスクリプト
```

## 主要コンポーネント

- **MarkdownRenderer**: LaTeX対応のMarkdownレンダラー
- **MessageBubble**: チャットメッセージの表示
- **ChatInput**: マルチモーダル対応の入力フィールド
- **Sidebar**: チャット履歴とMyGPT管理
- **GPTBuilder**: カスタムGPT作成インターフェース

## ライセンス

Apache 2.0