import { useState } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

const sizes = [60, 80, 100];
const prefectures = ["東京", "大阪", "北海道"];

export default function App() {
  const [size, setSize] = useState(100);
  const [prefecture, setPrefecture] = useState("");
  const [result, setResult] = useState(null);

  const handleCompare = () => {
    const yamato = yamatoData[String(size)]?.[prefecture];
    const sagawa = sagawaData[String(size)]?.[prefecture];

    if (yamato == null || sagawa == null) {
      setResult({ error: 'データが見つかりません' });
    } else {
      const cheapest = yamato < sagawa ? 'ヤマト' : sagawa < yamato ? '佐川' : '同額';
      setResult({ size, prefecture, yamato, sagawa, cheapest });
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>送料比較ツール V2</h1>

      <div style={{ marginBottom: 10 }}>
        <p>サイズを選んでください：</p>
        {sizes.map(s => (
          <button key={s} onClick={() => setSize(s)} style={{
            margin: 4,
            padding: 8,
            background: s === size ? '#0070f3' : '#eee',
            color: s === size ? 'white' : 'black',
            border: 'none',
            borderRadius: 4
          }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 10 }}>
        <p>都道府県を選んでください：</p>
        {prefectures.map(p => (
          <button key={p} onClick={() => setPrefecture(p)} style={{
            margin: 4,
            padding: 8,
            background: p === prefecture ? '#0070f3' : '#eee',
            color: p === prefecture ? 'white' : 'black',
            border: 'none',
            borderRadius: 4
          }}>
            {p}
          </button>
        ))}
      </div>

      <button onClick={handleCompare} style={{ marginTop: 10, padding: 10 }}>比較する</button>

      {result && (
        <div style={{ background: '#f0f0f0', padding: 10, marginTop: 20 }}>
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
