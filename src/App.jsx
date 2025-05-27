import { useState } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

const sizes = [60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260];
const allPrefectures = Object.keys(yamatoData[60]);

export default function App() {
  const [size, setSize] = useState(100);
  const [prefecture, setPrefecture] = useState(null);
  const [result, setResult] = useState(null);

  const handleClick = (pref) => {
    setPrefecture(pref);
    const yamato = yamatoData[size]?.[pref];
    const sagawa = sagawaData[size]?.[pref];

    if (yamato == null || sagawa == null) {
      setResult({ error: 'データが見つかりません' });
    } else {
      const cheapest = yamato < sagawa ? 'ヤマト' : sagawa < yamato ? '佐川' : '同額';
      setResult({ size, prefecture: pref, yamato, sagawa, cheapest });
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>送料比較ツール</h1>

      <div style={{ marginBottom: 10 }}>
        <p>サイズを選んでください：</p>
        {sizes.map(s => (
          <button key={s} onClick={() => setSize(s)} style={{
            margin: 4,
            padding: 8,
            background: s === size ? '#0070f3' : '#eee',
            color: s === size ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            fontSize: 14
          }}>
            {s}
          </button>
        ))}
      </div>

      <p>地図をクリックして都道府県を選んでください：</p>
      <object data="/japan.svg" type="image/svg+xml" style={{ width: '100%', maxWidth: '500px' }}
        onLoad={(e) => {
          const svgDoc = e.target.contentDocument;
          if (svgDoc) {
            allPrefectures.forEach(p => {
              const el = svgDoc.getElementById(p);
              if (el) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => handleClick(p));
              }
            });
          }
        }}
      />

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
