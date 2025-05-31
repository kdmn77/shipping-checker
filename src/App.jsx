import { useState, useEffect, useRef } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

/* ---------- 定数 ---------- */
const sizes = [60, 80, 100, 120, 140, 160, 170, 180, 200, 220, 240, 260, 'その他'];
const priceList = { '宅急便コンパクト': 770, 'ゆうパケット': 360, 'ゆうパケットプラス': 520 };

const regionColors = {
  北海道:'#2196f3', 東北:'#2196f3', 関東:'#ffeb3b', 中部:'#4caf50',
  近畿:'#81d4fa', 中国:'#f44336', 四国:'#ba68c8', 九州沖縄:'#f48fb1',
};

const regionMap = {
  北海道:['北海道'],
  東北:['青森','岩手','宮城','秋田','山形','福島'],
  関東:['茨城','栃木','群馬','埼玉','千葉','東京','神奈川'],
  中部:['新潟','富山','石川','福井','山梨','長野','岐阜','静岡','愛知'],
  近畿:['三重','滋賀','京都','大阪','兵庫','奈良','和歌山'],
  中国:['鳥取','島根','岡山','広島','山口'],
  四国:['徳島','香川','愛媛','高知'],
  九州沖縄:['福岡','佐賀','長崎','熊本','大分','宮崎','鹿児島','沖縄'],
};

/* 北から順に 47 都道府県 */
const prefOrder = [
  '北海道','青森','岩手','宮城','秋田','山形','福島','茨城','栃木','群馬',
  '埼玉','千葉','東京','神奈川','新潟','富山','石川','福井','山梨','長野',
  '岐阜','静岡','愛知','三重','滋賀','京都','大阪','兵庫','奈良','和歌山',
  '鳥取','島根','岡山','広島','山口','徳島','香川','愛媛','高知','福岡',
  '佐賀','長崎','熊本','大分','宮崎','鹿児島','沖縄'
];

/* ---------- コンポーネント ---------- */
export default function App() {
  const [size, setSize]             = useState(60);
  const [prefecture, setPrefecture] = useState(null);
  const [result, setResult]         = useState(null);

  const [showCustom, setShowCustom] = useState(false);
  const [dims, setDims]             = useState({ l:'', w:'', h:'' });
  const [matches, setMatches]       = useState([]);

  const lRef = useRef(null);
  const wRef = useRef(null);
  const hRef = useRef(null);

  /* ---------- 比較 ---------- */
  const compare = (pref = prefecture, si = size) => {
    if (typeof si !== 'number') return;
    const y = yamatoData[si]?.[pref];
    const s = sagawaData[si]?.[pref];
    if (y == null && s == null) { setResult(null); return; }
    const cheapest = y == null ? '佐川' : s == null ? 'ヤマト' : y < s ? 'ヤマト' : s < y ? '佐川' : '同額';
    setResult({ size:si, prefecture:pref, yamato:y, sagawa:s, cheapest });
  };

  /* ---------- カスタム判定 ---------- */
  useEffect(() => {
    if (!showCustom) return;
    const { l,w,h } = dims;
    if (!l || !w || !h) { setMatches([]); return; }
    const nums = [Number(l),Number(w),Number(h)];
    const [a,b,c] = [...nums].sort((x,y)=>y-x);
    const sum = nums.reduce((p,n)=>p+n,0);
    const list=[];
    if ((a<=25 && b<=20 && c<=5)||(a<=34 && b<=25 && c<=5)) list.push('宅急便コンパクト');
    if (sum<=60 && a<=34 && c<=3)                             list.push('ゆうパケット');
    if (a<=24 && b<=17 && c<=7)                               list.push('ゆうパケットプラス');
    setMatches(list);
  }, [dims, showCustom]);

  /* ---------- ハンドラ ---------- */
  const handleSizeClick = s=>{
    setSize(s);
    if (s==='その他'){ setShowCustom(true); setResult(null); }
    else             { setShowCustom(false); compare(prefecture,s); }
  };
  const handlePrefClick = p=>{ setPrefecture(p); compare(p,size); };
  const onDimChange = (key, val) => {
    if (val.length>2) return;
    setDims(prev=>({...prev,[key]:val}));
    if (val.length===2){
      if (key==='l')   wRef.current?.focus();
      else if (key==='w') hRef.current?.focus();
    }
  };

  /* ---------- JSX ---------- */
  return (
    <div style={{
      maxWidth:420, width:'100%', padding:'1vh 2vw',
      fontFamily:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif'
    }}>
      <h1 style={{fontSize:'5.5vw',margin:'0 0 1vh'}}>送料比較ツール</h1>

      {/* 結果 */}
      <div style={{background:'#f0f0f0',padding:'1vh 2vw',minHeight:'8vh',marginBottom:'1vh',fontSize:'3.8vw'}}>
        {showCustom ? matches.length ? (()=>{const min=Math.min(...matches.map(m=>priceList[m]));return (
          <ul style={{margin:0,paddingLeft:'4vw'}}>
            {matches.map(m=>(
              <li key={m}><span style={{fontWeight:priceList[m]===min?'bold':'normal'}}>
                {m}：{priceList[m].toLocaleString()}円
              </span></li>))}
          </ul>
        );})() : <p>該当なし</p> : result ? <>
          <div style={{fontWeight:'bold'}}>最安: {result.cheapest}（
            {result.cheapest==='ヤマト'
              ? result.yamato?.toLocaleString()+'円'
              : result.sagawa?.toLocaleString()+'円'}／{result.size}／{result.prefecture}）</div>
          <div style={{fontSize:'3.2vw'}}>
            ヤマト: {result.yamato!==undefined?result.yamato.toLocaleString()+'円':'―円'}／
            佐川: {result.sagawa!==undefined?result.sagawa.toLocaleString()+'円':'―円'}
          </div>
        </> : <p>サイズと都道府県を選択</p>}
      </div>

      {/* サイズ */}
      <p style={{margin:'0 0 .5vh',fontSize:'4vw'}}>サイズ：</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:'1vw',marginBottom:'1vh'}}>
        {sizes.map(s=>(
          <button key={s} onClick={()=>handleSizeClick(s)} style={{
            width:'18%', padding:'.7vh 0',
            background:s===size?'#0070f3':'#eee', color:s===size?'#fff':'#000',
            border:0,borderRadius:4,fontSize:'3.2vw'
          }}>{s}</button>
        ))}
      </div>

      {/* カスタム入力 */}
      {showCustom && (
        <>
          <p style={{margin:'0 0 .5vh',fontSize:'4vw'}}>縦×横×高さ(cm)：</p>
          <div style={{display:'flex',gap:'1vw',marginBottom:'1vh'}}>
            <input ref={lRef} type="number" placeholder="縦" value={dims.l}
              onChange={e=>onDimChange('l',e.target.value)}
              style={{width:'30%',padding:'.7vh 0',fontSize:'3.5vw',textAlign:'center',
              border:'1px solid #ccc',borderRadius:4}} />
            <input ref={wRef} type="number" placeholder="横" value={dims.w}
              onChange={e=>onDimChange('w',e.target.value)}
              style={{width:'30%',padding:'.7vh 0',fontSize:'3.5vw',textAlign:'center',
              border:'1px solid #ccc',borderRadius:4}} />
            <input ref={hRef} type="number" placeholder="高さ" value={dims.h}
              onChange={e=>setDims(prev=>({...prev,h:e.target.value}))}
              style={{width:'30%',padding:'.7vh 0',fontSize:'3.5vw',textAlign:'center',
              border:'1px solid #ccc',borderRadius:4}} />
          </div>
        </>
      )}

      {/* 都道府県 */}
      <p style={{margin:'0 0 .5vh',fontSize:'4vw'}}>都道府県：</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:'1vw'}}>
        {prefOrder.map(p=>{
          const region = Object.keys(regionMap).find(r=>regionMap[r].includes(p));
          return (
            <button key={p} onClick={()=>handlePrefClick(p)} style={{
              width:'18%', padding:'.7vh 0', marginBottom:'1vh',
              background:regionColors[region]||'#ccc',
              color:p===prefecture?'#fff':'#000',
              border:p===prefecture?'2px solid #000':'0',
              borderRadius:4,fontSize:'3vw'
            }}>{p}</button>
          );
        })}
      </div>
    </div>
  );
}
