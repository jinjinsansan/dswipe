## NOTE 機能リリースチェックリスト

### 1. コード/DB準備
- [ ] `backend/migrations/add_notes_tables.sql` を本番DBへ適用
- [ ] `backend/migrations/add_note_purchase_function.sql` を本番DBへ適用
- [ ] `purchase_note_with_points` 関数の権限（`authenticated`/`service_role`）を確認
- [ ] Supabase上で `notes` / `note_purchases` / `point_transactions.related_note_id` の存在を確認

### 2. 環境変数
- [ ] API: `SUPABASE_URL` / `SUPABASE_KEY` / JWT秘密鍵が正しく設定されている
- [ ] フロント: `NEXT_PUBLIC_API_URL` が本番APIを指している

### 3. 自動テスト
- [ ] `pytest backend/tests/test_notes_purchase.py`
- [ ] `npm run build`

### 4. ステージング検証
- [ ] NOTE作成→公開→公開ページで閲覧を確認
- [ ] 有料NOTE購入フロー（ポイント減算＆有料ブロック解放）
- [ ] 無料NOTEの閲覧・公開一覧フィルタ（無料/有料）が正しく動作
- [ ] 管理者パネルで NOTE が一覧表示され、非公開／削除操作が即時反映
- [ ] 管理者操作後、`moderation_events` に履歴が追加される
- [ ] 既存LP・商品機能でリグレッションがない

### 5. 本番デプロイ
- [ ] 上記チェック完了後にコードデプロイ
- [ ] NOTE機能公開直後に AllNOTES ページを目視確認
- [ ] 管理者パネルで1件テスト投稿を非公開にしてモデレーション動作を確認

### 6. 告知・ドキュメント
- [ ] ユーザー向けアナウンス（NOTE投稿方法、ポイント購入案内）
- [ ] 社内向け運用ガイド（NOTE監視手順・非公開/削除の基準）

### 7. ロールバック手順（必要時）
- [ ] 緊急停止時は管理者パネルから該当NOTEを非公開に
- [ ] 大規模障害時は `notes` テーブルで `status='draft'` に一括更新
- [ ] `purchase_note_with_points` を削除/無効化し購入APIを一時停止
