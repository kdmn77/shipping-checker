import { useState } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

const sizes = [60, 80, 100, 120, 140, 160, 170, 180, 200, 220, 240, 260];

// 地域分けとカラー
const regionColors = {
  北海道: '#2196f3',
  東北: '#2196f3',
  関東: '#ffeb3b',
  中部: '#4caf50',
  近畿: '#81d4fa',
  中国: '#f44336',
  四国: '#ba68c8',
  九州沖縄: '#f48fb1',
};

const regionMap = {
  北海道: ['北海道'],
  東北: ['青森', '岩手', '宮城', '秋田', '山形', '福島'],
  関東: ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川'],
  中部: ['新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知'],
  近畿: ['三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'],
  中国: ['鳥取', '島根', '岡山', '広島', '山口'],
  四国: ['徳島', '香川', '愛媛', '高知'],
  九州沖縄: ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄']
};

const allPrefectures = Object.values(regionMap).flat();

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

const getColor = (pref) => {
  if (pref === '東京') return '#e53935'; // 東京だけ赤
  for (const region in regionMap) {
    if (regionMap[region].includes(pref)) {
      return regionColors[region];
    }
  }
  return '#ccc';
};

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
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
              background: getColor(p),
              color: p === prefecture ? '#fff' : '#000',
              border: p === prefecture ? '2px solid #000' : 'none',
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
    <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
      最安: {result.cheapest}
      {result.cheapest !== '同額' && (
        <>
          {result.cheapest === 'ヤマト' && result.yamato !== undefined && (
            <>（{result.yamato.toLocaleString()}円）</>
          )}
          {result.cheapest === '佐川' && result.sagawa !== undefined && (
            <>（{result.sagawa.toLocaleString()}円）</>
          )}
        </>
      )}
    </p>
    <p>サイズ: {result.size}</p>
    {result.yamato !== undefined && <p>ヤマト: {result.yamato.toLocaleString()}円</p>}
    {result.sagawa !== undefined && <p>佐川: {result.sagawa.toLocaleString()}円</p>}
    <p>配送先: {result.prefecture}</p>
  </div>
)}
    </div>
  );
}
