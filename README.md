# shipping-checker

送料比較（ヤマト・佐川・パケット系）と、問い合わせ番号の追跡。

- 料金表: `src/yamatoData.json` / `src/sagawaData.json`、パケット系は `index.html` 内の `PACKET`
- 追跡: `api/track.js` がヤマト・佐川・日本郵便の追跡ページを同時に照会し、記録のある会社と最新状況を返す
- iPhone: Safari で開き、共有 →「ホーム画面に追加」
