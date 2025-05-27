import { useState, useEffect } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

const sizes = [60, 80, 100];
const allPrefectures = ["東京", "大阪", "北海道"];

export default function App() {
  const [size, setSize] = useState(100);
  const [prefecture, setPrefecture] = useState(null);
  const [result, setResult] = useState(null);

  const handleClick = (pref) => {
    setPrefecture(pref);
    const yamato = yamatoData[String(size)]?.[pref];
    const sagawa = sagawaData[String(size)]?.[pref];

    if (yamato == null || sagawa == null) {
      setResult({ error: 'データが見つかりません' });
    } else {
      const cheapest = yamato < sagawa ? 'ヤマト' : sagawa < yamato ? '佐川' : '同額';
      setResult({ size, prefecture: pref, yamato, sagawa, cheapest });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const svgDoc = document.querySelector('object')?.contentDocument;
      if (svgDoc) {
        allPrefectures.forEach(p => {
          const el = svgDoc.getElementById(p);
          if (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => handleClick(p));
          }
        });
      }
    }, 500); // SVG描画待ち

    return () => clearTimeout(timer);
  }, [size]);

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>送料比較ツール V4</h1>

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

      <p>地図をクリックしてください：</p>
      <object data="/japan.svg" type="image/svg+xml" style={{ width: '100%', maxWidth: '500px' }} />

      {result && (
        <div style={{ background: '#f0f0f0', padding: 10, marginTop: 20 }}>
          {result.error ? (
            <p style={{ color: 'red' }}>{result.error}</p>
          ) : (
            <>
              <p>サイズ: {result.size}</p>
