# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

「お薬のんだ？」という名前の服薬管理用Progressive Web App (PWA)です。バニラHTML、CSS、JavaScriptで構築された単一ページアプリケーションで、AI搭載の写真認証機能を使って服薬記録をサポートします。

## ファイル構成と管理

- **medication-tracker.html**: PWA全体を含むメインアプリケーションファイル
- **mock/**: モックデータ、テストファイル、開発用アセットの保存ディレクトリ
- 作成したファイルは、プロジェクトルートと適切なサブディレクトリの両方に保存してバージョン管理する

## 主要機能

アプリケーションの機能：
- 薬の登録と管理
- 食事時間に基づく日次服薬トラッキング
- 空の薬シート検出によるAI写真認証
- 在庫レベル警告と通知
- オフライン機能用のService Worker
- モバイルアプリ風体験のためのPWA機能

## AI統合アーキテクチャ

服薬確認のための複数のAI画像認識API対応：
- Google Vision API（オブジェクト検出とOCR）
- OpenAI GPT-4 Vision（文脈解析）
- Canvasベースの画像処理によるローカル代替解析
- 複数のAI結果を組み合わせる重み付き投票システム

## 開発ガイドライン

### ファイル管理
- すべてのmockファイルは `mock/` サブディレクトリに保存
- プロジェクトファイルをバージョン管理で維持
- PWA互換性のためHTML、CSS、JavaScriptを単一ファイルに保持

### API設定
- 外部API統合にはapi-config.jsファイルが必要
- API利用不可時はローカル解析にフォールバック
- AI機能のプログレッシブエンハンスメントアプローチ

### PWA要件
- オフライン機能用のService Worker実装
- アプリインストール用のManifestファイル
- データ永続化用のローカルストレージ
- モバイルデバイス用のレスポンシブデザイン

## テストと検証

純粋なクライアントサイドアプリケーションのため：
- 複数ブラウザでのテスト（Chrome、Firefox、Safari）
- PWAインストール機能の確認
- オフライン機能のテスト
- カメラ権限と写真撮影の検証
- localStorageデータ永続化の確認

## 依存関係

アプリケーションで使用：
- バニラJavaScript（外部フレームワークなし）
- 画像処理用のHTML5 Canvas API
- Web API：カメラ、通知、Service Worker
- データ永続化用のLocalStorage
- レスポンシブデザイン用のCSS3

ビルドプロセスやパッケージ管理は不要 - すべてのコードはHTMLファイル内に自己完結

## GitHub情報

### リポジトリ
- URL: https://github.com/Jumps710/medicationtracker
- GitHub Pages: https://jumps710.github.io/medicationtracker/

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.