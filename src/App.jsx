import { useState } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

const sizes = [60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260];
const allPrefectures = Object.keys(yamatoData[60]);

export default function App() {
  const [size, setSize] = useState(60);
  const [prefecture, setPrefecture] = useState(null);
  const [result, setResult] = useState(null);

  const compare = () => {
    const yamato = yamatoData[size]?.[prefecture];
    const sagawa = sagawaData[size]?.[prefecture];

    if (yamato == null || sagawa == null) {
      setResult({ error: 'データが見つかりません' });
      return;
    }

    const cheapest = yamato < sagawa ? 'ヤマト' : sagawa < yamato ? '佐川' : '同額';
    setResult({ size, prefecture, yamato, sagawa, cheapest });
  };

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <h1>送料比較ツール</h1>
      <label>サイズ</label>
      <select value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ width: '100%', marginBottom: 10 }}>
        {sizes.map(s => <option key={s} value={s}>{s} サイズ</option>)}
      </select>

      <label>都道府県（クリックで選択）</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 10 }}>
        {allPrefectures.map(p => (
          <button
            key={p}
            onClick={() => setPrefecture(p)}
            style={{
              margin: 4,
              padding: 8,
              minWidth: 60,
              background: p === prefecture ? '#0070f3' : '#eee',
              color: p === prefecture ? 'white' : 'black',
              border: 'none',
              borderRadius: 5,
              fontSize: 12
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <button onClick={compare} style={{ width: '100%', marginBottom: 10 }}>比較する</button>

      {result && (
        <div style={{ background: '#f0f0f0', padding: 10 }}>
          {result.error ? (
            <p style={{ color: 'red' }}>{result.error}</p>
          ) : (
            <>
              <p>サイズ: {result.size}</p>
              <p>配送先: {result.prefecture}</p>
              <p>ヤマト: {result.yamato.toLocaleString()}円</p>
              <p>佐川: {result.sagawa.toLocaleString()}円</p>
              <p><strong>最安: {result.cheapest}</strong></p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
