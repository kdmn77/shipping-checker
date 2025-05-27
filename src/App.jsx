import { useState } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

const sizes = [60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260];
const allPrefectures = Object.keys(yamatoData[60]);

export default function App() {
  const [size, setSize] = useState(100);
  const [prefecture, setPrefecture] = useState('東京');
  const [result, setResult] = useState(null);

  const compare = (newPrefecture = prefecture, newSize = size) => {
    const yamato = yamatoData[newSize]?.[newPrefecture];
    const sagawa = sagawaData[newSize]?.[newPrefecture];

    if (yamato == null && sagawa == null) {
      setResult(null);
    } else {
      const cheapest =
        yamato == null ? '佐川' :
        sagawa == null ? 'ヤマト' :
        yamato < sagawa ? 'ヤマト' :
        sagawa < yamato ? '佐川' : '同額';
      setResult({ size: newSize, prefecture: newPrefecture, yamato, sagawa, cheapest });
    }
  };

  const handleSizeClick = (s) => {
    setSize(s);
    compare(prefecture, s);
  };

  const handlePrefectureClick = (p) => {
    setPrefecture(p);
    compare(p, size);
  };

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <h1>送料比較ツール</h1>

      <p>サイズを選んでください：</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 10 }}>
        {sizes.map(s => (
          <button
            key={s}
            onClick={() => handleSizeClick(s)}
            style={{
              margin: 4,
              padding: 8,
              background: s === size ? '#0070f3' : '#eee',
              color: s === size ? 'white' : 'black',
              border: 'none',
              borderRadius: 5,
              fontSize: 14
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <p>都道府県を選んでください：</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 10 }}>
        {allPrefectures.map(p => (
          <button
            key={p}
            onClick={() => handlePrefectureClick(p)}
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

      {result && (
        <div style={{ background: '#f0f0f0', padding: 10 }}>
          <p>サイズ: {result.size}</p>
          <p>配送先: {result.prefecture}</p>
          {result.yamato !== undefined && <p>ヤマト: {result.yamato.toLocaleString()}円</p>}
          {result.sagawa !== undefined && <p>佐川: {result.sagawa.toLocaleString()}円</p>}
          <p><strong>最安: {result.cheapest}</strong></p>
        </div>
      )}
    </div>
  );
}
