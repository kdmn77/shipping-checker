import { useState, useEffect, useRef } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

/* ===== 定数 ===== */
const sizes = [
  '60より小さいサイズ',  // カスタム (改行で 2 行表示)
  60, 80, 100, 120, 140, 160, 170, 180, 200, 220, 240, 260
];
const priceList = {
  '宅急便コンパクト': 770,
  'ゆうパケット':      360,
  'ゆうパケットプラス': 520,
};

const regionColors = {
  北海道:'#2196f3', 東北:'#2196f3', 関東:'#ffeb3b', 中部:'#4caf50',
  近畿:'#81d4fa', 中国:'#f44336', 四国:'#ba68c8', 九州沖縄:'#f48fb1',
};
const regionGroups = [
  { name:'北海道・東北', list:['北海道','青森','岩手','宮城','秋田','山形','福島'] },
  { name:'関東',         list:['茨城','栃木','群馬','埼玉','千葉','東京','神奈川'] },
  { name:'中部',         list:['新潟','富山','石川','福井','山梨','長野','岐阜','静岡','愛知'] },
  { name:'近畿',         list:['三重','滋賀','京都','大阪','兵庫','奈良','和歌山'] },
  { name:'中国',         list:['鳥取','島根','岡山','広島','山口'] },
  { name:'四国',         list:['徳島','香川','愛媛','高知'] },
  { name:'九州沖縄',     list:['福岡','佐賀','長崎','熊本','大分','宮崎','鹿児島','沖縄'] },
];

/* ===== 共通スタイル ===== */
const labelStyle = { display:'inline-block', width:'22vw', fontSize:'3.8vw', margin:'0 0 .5vh' };
/* iOS ズーム防止 → fontSize 16px 以上 */
const inputStyle = {
  width:'30%', padding:'.6vh 0', textAlign:'center',
  fontSize:'16px', border:'1px solid #ccc', borderRadius:4
};

/* ===== コンポーネント ===== */
export default function App() {
  const [size, setSize]     = useState(60);
  const [pref, setPref]     = useState(null);
  const [result, setResult] = useState(null);

  const [showCustom, setShowCustom] = useState(false);
  const [dims, setDims]             = useState({ l:'', w:'', h:'' });   // h = 厚み
  const [matches, setMatches]       = useState([]);

  /* refs forフォーカス */
  const lRef = useRef(null);
  const wRef = useRef(null);
  const hRef = useRef(null);

  /* ---- 通常サイズ比較 ---- */
  const compare = (p = pref, s = size) => {
    if (typeof s !== 'number') return;  // カスタムは比較なし
    const y = yamatoData[s]?.[p];
    const g = sagawaData[s]?.[p];
    if (y == null && g == null) { setResult(null); return; }

    const cheapest =
      y == null ? '佐川' :
      g == null ? 'ヤマト' :
      y < g ? 'ヤマト' : g < y ? '佐川' : '同額';

    setResult({ size:s, prefecture:p, yamato:y, sagawa:g, cheapest });
  };

  /* ---- カスタムサイズ判定 ---- */
  useEffect(() => {
    if (!showCustom) return;
    const { l,w,h } = dims;
    if (!l || !w || !h) { setMatches([]); return; }

    const nums = [+l,+w,+h];
    const [a,b,c] = [...nums].sort((x,y)=>y-x);
    const sum = nums.reduce((p,n)=>p+n,0);
    const list = [];

    if ((a<=25&&b<=20&&c<=5) || (a<=34&&b<=25&&c<=5)) list.push('宅急便コンパクト');
    if (sum<=60 && a<=34 && c<=3)                       list.push('ゆうパケット');
    if (a<=24 && b<=17 && c<=7)                         list.push('ゆうパケットプラス');

    setMatches(list);
  }, [dims, showCustom]);

  /* ---- ハンドラ ---- */
  const handleSize = s => {
    setSize(s);
    if (s === '60より小さいサイズ') {
      setShowCustom(true);
      setResult(null);
    } else {
      setShowCustom(false);
      compare(pref, s);
    }
  };
  const handlePref = p => { setPref(p); compare(p, size); };

  /* 入力: 縦→横→厚み と順に移動 (厚みは 1 桁) */
  const handleInput = key => e => {
    let v = e.target.value.replace(/\D/g,'');
    if (key === 'h') v = v.slice(0,1);           // 厚みは 1 桁
    else             v = v.slice(0,2);           // 縦・横は 2 桁
    setDims(d => ({ ...d, [key]: v }));

    /* 次欄が空欄の時のみフォーカス移動 (二重ジャンプ防止) */
    if (key === 'l' && v.length === 2 && wRef.current?.value.length === 0) {
