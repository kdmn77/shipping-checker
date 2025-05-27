import { useState } from 'react';

const yamatoData = {
  100: { 埼玉: 840 },
};

const sagawaData = {
  100: { 埼玉: 670 },
};

function App() {
  const [size, setSize] = useState(100);
  const [prefecture, setPrefecture] = useState('埼玉');
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
    <div style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
      <h1>送料比較ツール</h1>
      <input
        type="number"
        value={size}
        onChange={(e) => setSize(Number(e.target.value))}
        placeholder="サイズ (例: 100)"
        style={{ width: '100%', marginBottom: 10 }}
      />
      <input
        value={prefecture}
        onChange={(e) => setPrefecture(e.target.value)}
        placeholder="都道府県 (例: 埼玉)"
        style={{ width: '100%', marginBottom: 10 }}
      />
      <button onClick={compare} style={{ width: '100%', marginBottom: 10 }}>比較する</button>
      {result && (
        <div style={{ background: '#f0f0f0', padding: 10 }}>
          {result.error ? (
            <p style={{ color: 'red' }}>{result.error}</p>
          ) : (
            <>
              <p>サイズ: {result.size}</p>
              <p>配送先: {result.prefecture}</p>
              <p>ヤマト: {result.yamato}円</p>
              <p>佐川: {result.sagawa}円</p>
              <p><strong>最安: {result.cheapest}</strong></p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;