import { useState } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

const sizes = [60, 80, 100, 120, 140, 160, 170, 180, 200, 220, 240, 260];
const prefectures = ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島', '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'];

export default function App() {
  const [size, setSize] = useState(100);
  const [prefecture, setPrefecture] = useState("");
  const [result, setResult] = useState(null);

  const handleCompare = () => {
    const yamato = yamatoData[String(size)]?.[prefecture];
    const sagawa = sagawaData[String(size)]?.[prefecture];

    if (yamato == null && sagawa == null) {
      setResult({ error: 'データが見つかりません' });
    } else {
      let cheapest;
      if (yamato == null) {
        cheapest = '佐川';
      } else if (sagawa == null) {
        cheapest = 'ヤマト';
      } else {
        cheapest = yamato < sagawa ? 'ヤマト' : sagawa < yamato ? '佐川' : '同額';
      }
      setResult({ size, prefecture, yamato, sagawa, cheapest });
    }
  };

  return (
    <div style={ padding: 20, maxWidth: 800, margin: '0 auto' }>
      <h1>送料比較ツール V2</h1>

      <div style={ marginBottom: 10 }>
        <p>サイズを選んでください：</p>
        <div style={ display: 'flex', flexWrap: 'wrap' }>
          {sizes.map(s => (
            <button key={s} onClick={() => setSize(s)} style={
              margin: 4,
              padding: 8,
              background: s === size ? '#0070f3' : '#eee',
              color: s === size ? 'white' : 'black',
              border: 'none',
              borderRadius: 4
            }>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={ marginBottom: 10 }>
        <p>都道府県を選んでください：</p>
        <div style={ display: 'flex', flexWrap: 'wrap' }>
          {prefectures.map(p => (
            <button key={p} onClick={() => setPrefecture(p)} style={
              margin: 4,
              padding: 8,
              background: p === prefecture ? '#0070f3' : '#eee',
              color: p === prefecture ? 'white' : 'black',
              border: 'none',
              borderRadius: 4
            }>
              {p}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleCompare} style={ marginTop: 10, padding: 10 }>比較する</button>

      {result && (
        <div style={ background: '#f0f0f0', padding: 10, marginTop: 20 }>
          {result.error ? (
            <p style={ color: 'red' }>{result.error}</p>
          ) : (
            <>
              <p>サイズ: {result.size}</p>
              <p>配送先: {result.prefecture}</p>
              {result.yamato !== undefined && <p>ヤマト: {result.yamato.toLocaleString()}円</p>}
              {result.sagawa !== undefined && <p>佐川: {result.sagawa.toLocaleString()}円</p>}
              <p><strong>最安: {result.cheapest}</strong></p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
