# Google Maps API Setup Guide

## 1. Google Cloud Platformでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名を入力（例: "ITSS Schedule App"）

## 2. Google Maps API を有効化

1. APIs & Services > Library に移動
2. 以下のAPIを検索して有効化:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

## 3. API Key を作成

1. APIs & Services > Credentials に移動
2. "Create Credentials" > "API key" をクリック
3. API keyが生成される（例: `AIzaSyB...`）

## 4. API Key を制限 (セキュリティのため推奨)

1. 作成したAPI keyの横の編集アイコンをクリック
2. **Application restrictions**:
   - Website restrictions を選択
   - http://localhost:*, http://your-domain.com を追加
3. **API restrictions**:
   - restrict key を選択
   - Maps JavaScript API, Places API, Geocoding API を選択
4. Save

## 5. プロジェクトに API Key を追加

### フロントエンド (.env ファイル作成)

```bash
cd frontend
```

`.env` ファイルを作成:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**重要**: `.env` ファイルは `.gitignore` に含まれていることを確認！

## 6. 動作確認

1. サーバーを再起動
```bash
npm run dev
```

2. `/schedule/create` ページにアクセス
3. 「地図から選択」ボタンをクリック
4. Google Maps が表示されればOK！

## トラブルシューティング

### "Google Maps の読み込みに失敗しました"
- API keyが正しく設定されているか確認
- `.env` ファイルが `frontend/` ディレクトリにあるか確認
- サーバーを再起動したか確認

### "RefererNotAllowedMapError"
- Google Cloud Console でドメイン制限を確認
- `http://localhost:5173` が許可されているか確認

### "API key required"
- `.env` ファイルに `VITE_GOOGLE_MAPS_API_KEY` が設定されているか確認
- `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` でアクセスできるか確認

## 料金について

- Google Maps は**無料枠**があります（月$200相当）
- 開発中は無料枠内で十分です
- 本番環境では使用量を監視してください

## 参考リンク

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
