import { useState, useEffect } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

const sizes = [60, 80, 100, 120, 140, 160, 170, 180, 200, 220, 240, 260, 'その他'];

const regionColors = {
  北海道: '#2196f3', 東北: '#2196f3', 関東: '#ffeb3b', 中部: '#4caf50',
  近畿: '#81d4fa', 中国: '#f44336', 四国: '#ba68c8', 九州沖縄: '#f48fb1',
};

const regionMap = {
  北海道: ['北海道'],
  東北: ['青森','岩手','宮城','秋田','山形','福島'],
  関東: ['茨城','栃木','群馬','埼玉','千葉','東京','神奈川'],
  中部: ['新潟','富山','石川','福井','山梨','長野','岐阜','静岡','愛知'],
  近畿: ['三重','滋賀','京都','大阪','兵庫','奈良','和歌山'],
  中国: ['鳥取','島根','岡山','広島','山口'],
  四国: ['徳島','香川','愛媛','高知'],
  九州沖縄: ['福岡','佐賀','長崎','熊本','大分','宮崎','鹿児島','沖縄'],
};
const allPrefectures = Object.values(regionMap).flat();

export default function App() {
  const [size, setSize] = useState(60);
  const [prefecture, setPrefecture] = useState(null);
  const [result, setResult] = useState(null);

  // 「その他」用
  const [showCustom, setShowCustom] = useState(false);
  const [dims, setDims] = useState({ l: '', w: '', h: '' });
  const [matches, setMatches] = useState([]);

  const compare = (newPref = prefecture, newSize = size) => {
    if (typeof newSize !== 'number') return;               // 「その他」は比較しない
    const y = yamatoData[newSize]?.[newPref];
    const s = sagawaData[newSize]?.[newPref];
    if (y == null && s == null) setResult(null);
    else {
      const cheapest =
        y == null ? '佐川' : s == null ? 'ヤマト' : y < s ? 'ヤマト' : s < y ? '佐川' : '同額';
      setResult({ size: newSize, prefecture: newPref, yamato: y, sagawa: s, cheapest });
    }
  };

  // カスタムサイズ判定
  useEffect(() => {
    if (!showCustom) return;
    const { l, w, h } = dims;
    const nums = [Number(l), Number(w), Number(h)];
    if (nums.some(n => !n)) { setMatches([]); return; }

    const sorted = [...nums].sort((a, b) => b - a);
    const sum = nums.reduce((a, b) => a + b, 0);
    const list = [];

    // 宅急便コンパクト
    const compact1 = sorted[0] <= 25 && sorted[1] <= 20 && sorted[2] <= 5;
    const compact2 = sorted[0] <= 34 && sorted[1] <= 25 && sorted[2] <= 5;
    if (compact1 || compact2) list.push('宅急便コンパクト');

    // ゆうパケット
    if (sum <= 60 && sorted[0] <= 34 && sorted[2] <= 3) list.push('ゆうパケット');

    // ゆうパケットプラス
    if (sorted[0] <= 24 && sorted[1] <= 17 && sorted[2] <= 7) list.push('ゆうパケットプラス');

    setMatches(list);
  }, [dims, showCustom]);

  const handleSizeClick = (s) => {
    setSize(s);
    if (s === 'その他') {
      setShowCustom(true);
      setResult(null);
    } else {
      setShowCustom(false);
      compare(prefecture, s);
    }
  };

  const handlePrefectureClick = (p) => {
    setPrefecture(p);
    compare(p, size);
  };

  const getColor = (pref) => {
    if (pref === '東京') return '#e53935';
    if (pref === '大阪') return '#1976d2';
    for (const region in regionMap) if (regionMap[region].includes(pref)) return regionColors[region];
    return '#ccc';
  };

  return (
    <div style={{ padding: 10, maxWidth: 420, margin: '0 auto',
                  fontFamily: '-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif' }}>
      <h1>送料比較ツール</h1>

      {/* 結果表示エリア */}
      <div style={{ background: '#f0f0f0', padding: '8px 10px', marginBottom: 16, minHeight: 60 }}>
        {showCustom ? (
          matches.length ? <p>適用可能：{matches.join('、')}</p>
                         : <p>該当する配送方法はありません</p>
        ) : result ? (
          <>
            <p style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
              最安: {result.cheapest}（
              {result.cheapest === 'ヤマト' ? result.yamato?.toLocaleString()+'円'
                                             : result.sagawa?.toLocaleString()+'円'}
              ／{result.size}／{result.prefecture}）
            </p>
            <p style={{ fontSize: 14, margin: 0 }}>
              ヤマト: {result.yamato !== undefined ? result.yamato.toLocaleString()+'円' : '―円'}<br/>
              佐川: {result.sagawa !== undefined ? result.sagawa.toLocaleString()+'円' : '―円'}
            </p>
          </>
        ) : (
          <p>サイズと都道府県を選ぶと、送料を表示します。</p>
        )}
      </div>

      {/* サイズボタン */}
      <p>サイズを選んでください：</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 10 }}>
        {sizes.map(s => (
          <button key={s} onClick={() => handleSizeClick(s)}
            style={{
              margin: 4, padding: 8,
              background: s === size ? '#0070f3' : '#eee',
              color: s === size ? 'white' : 'black',
              border: 'none', borderRadius: 4, fontSize: 14
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* カスタム入力欄 */}
      {showCustom && (
        <div style={{ marginBottom: 16 }}>
          <p>縦×横×高さ(cm) を入力：</p>
          <div style={{ display:'flex', gap:4, marginBottom:8 }}>
            {['l','w','h'].map((k,i)=>(
              <input key={k} type="number" placeholder={['縦','横','高さ'][i]}
                value={dims[k]} onChange={e=>setDims({...dims,[k]:e.target.value})}
                style={{ flex:1, padding:6, border:'1px solid #ccc', borderRadius:4 }} />
            ))}
          </div>
        </div>
      )}

      {/* 都道府県ボタン */}
      <p>都道府県を選んでください：</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 10 }}>
        {allPrefectures.map(p => (
          <button key={p} onClick={() => handlePrefectureClick(p)}
            style={{
              margin: 2, padding: '6px 8px', minWidth: 48,
              background: getColor(p),
              color: p === prefecture ? '#fff' : '#000',
              border: p === prefecture ? '2px solid #000' : 'none',
              borderRadius: 4, fontSize: 12
            }}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
