import { useState, useEffect, useRef } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

/* ===== 定数 ===== */
const customLabel = '60以下';
const thresholds  = [60,80,100,120,140,160,170,180,200,220,240,260];
const priceList   = { '宅急便コンパクト':770, 'ゆうパケット':360, 'ゆうパケットプラス':520 };

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

/* ===== スタイル ===== */
const labelStyle = { display:'inline-block', width:'22vw', fontSize:'3.8vw', margin:'0 0 .5vh' };
const inputStyle = { width:'30%', padding:'.6vh 0', textAlign:'center',
                     fontSize:'16px', border:'1px solid #ccc', borderRadius:4 };

/* ===== コンポーネント ===== */
export default function App() {
  /* ------------- state ------------- */
  const [size, setSize]   = useState(60);
  const [pref, setPref]   = useState(null);
  const [result, setRes]  = useState(null);
  const [dims, setDims]   = useState({ l:'', w:'', h:'' });
  const [matches, setMat] = useState([]);

  /* refs for Enter キー移動 */
  const lRef = useRef(null);
  const wRef = useRef(null);
  const hRef = useRef(null);

  /* ---------- 料金比較 ---------- */
  const compare = (s=size, p=pref) => {
    if (typeof s !== 'number') { setRes(null); return; }
    const y = yamatoData[s]?.[p];
    const g = sagawaData[s]?.[p];
    if (y==null && g==null) { setRes(null); return; }
    const cheapest = y==null?'佐川':g==null?'ヤマト':y<g?'ヤマト':g<y?'佐川':'同額';
    setRes({ size:s, prefecture:p, yamato:y, sagawa:g, cheapest });
  };

  /* ---------- 寸法入力で自動判定 ---------- */
  useEffect(()=>{
    const { l,w,h } = dims;
    if (!(l&&w&&h)) { setMat([]); return; }

    const nums=[+l,+w,+h];
    const [a,b,c]=[...nums].sort((x,y)=>y-x);
    const sum=nums.reduce((p,n)=>p+n,0);

    const list=[];
    if ((a<=25&&b<=20&&c<=5)||(a<=34&&b<=25&&c<=5)) list.push('宅急便コンパクト');
    if (sum<=60 && a<=34 && c<=3)                   list.push('ゆうパケット');
    if (a<=24 && b<=17 && c<=7)                     list.push('ゆうパケットプラス');
    setMat(list);

    let auto=customLabel;
    for(const th of thresholds){ if(sum<=th){ auto=th; break; } }
    setSize(auto);
    typeof auto==='number'?compare(auto,pref):setRes(null);
  },[dims,pref]); // eslint-disable-line

  /* ---------- handlers ---------- */
  const handleInput = k => e=>{
    const v=e.target.value.replace(/\D/g,'').slice(0,3); // 3桁まで
    setDims(d=>({...d,[k]:v}));
  };
  const handleKey = nextRef => e=>{
    if(e.key==='Enter' && nextRef?.current){ nextRef.current.focus(); }
  };
  const handleSize = s=>{ setSize(s); typeof s==='number'?compare(s,pref):setRes(null); };
  const handlePref = p=>{ setPref(p); compare(size,p); };

  /* ---------- JSX ---------- */
  return (
    <div style={{maxWidth:420,width:'100%',padding:'1vh 2vw',
                 fontFamily:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif'}}>
      <h1 style={{fontSize:'5.3vw',margin:'0 0 1vh'}}>送料比較ツール</h1>

      {/* ---- 結果 / 特殊サービス ---- */}
      <div style={{background:'#f0f0f0',padding:'1vh',minHeight:'8vh',
                   marginBottom:'1vh',fontSize:'3.6vw'}}>
        {matches.length ? (()=>{const min=Math.min(...matches.map(m=>priceList[m]));return(
          <ul style={{margin:0,paddingLeft:'4vw'}}>
            {matches.map(m=>(
              <li key={m}><span style={{fontWeight:priceList[m]===min?'bold':'normal'}}>
                {m}：{priceList[m].toLocaleString()}円
              </span></li>
            ))}
          </ul>
        );})()
        : result ? (
          <>
            <div style={{fontWeight:'bold'}}>
              最安: {result.cheapest}（
              {result.cheapest==='ヤマト'?result.yamato?.toLocaleString()
                                         :result.sagawa?.toLocaleString()
              }円／{result.size}／{result.prefecture}）
            </div>
            <div style={{fontSize:'3vw'}}>
              ヤマト: {result.yamato!=null?result.yamato.toLocaleString()+'円':'―円'}／
              佐川:   {result.sagawa!=null?result.sagawa.toLocaleString()+'円':'―円'}
            </div>
          </>
        ) : <p style={labelStyle}>サイズと都道府県を選択</p>}
      </div>

      {/* ---- 寸法入力 ---- */}
      <p style={labelStyle}>縦×横×高さ(cm)：</p>
      <div style={{display:'flex',gap:'1vw',marginBottom:'1vh'}}>
        <input ref={lRef} type="number" placeholder="縦" value={dims.l}
          onChange={handleInput('l')} onKeyDown={handleKey(wRef)} style={inputStyle}/>
        <input ref={wRef} type="number" placeholder="横" value={dims.w}
          onChange={handleInput('w')} onKeyDown={handleKey(hRef)} style={inputStyle}/>
        <input ref={hRef} type="number" placeholder="高さ" value={dims.h}
          onChange={handleInput('h')} style={inputStyle}/>
      </div>

      {/* ---- サイズボタン ---- */}
      <p style={labelStyle}>サイズ：</p>
      <div style={{display:'flex',gap:'1vw',marginBottom:'1vh'}}>
        <button onClick={()=>handleSize(customLabel)} style={{
          width:'18%',padding:'.6vh 0',
          background:size===customLabel?'#0070f3':'#eee',
          color:size===customLabel?'#fff':'#000',
          border:0,borderRadius:4,fontSize:'3vw'
        }}>{customLabel}</button>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'1vw',marginBottom:'1vh'}}>
        {thresholds.map(s=>(
          <button key={s} onClick={()=>handleSize(s)} style={{
            width:'18%',padding:'.6vh 0',
            background:s===size?'#0070f3':'#eee',
            color:s===size?'#fff':'#000',
            border:0,borderRadius:4,fontSize:'3vw'
          }}>{s}</button>
        ))}
      </div>

      {/* ---- 都道府県 ---- */}
      <p style={labelStyle}>都道府県：</p>
      {regionGroups.map(({name,list})=>(
        <div key={name} style={{marginBottom:'1vh'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:'1vw'}}>
            {list.map(p=>(
              <button key={p} onClick={()=>handlePref(p)} style={{
                width:'18%',padding:'.6vh 0',
                background:regionColors[name.split('・')[0]]||'#ccc',
                color:p===pref?'#fff':'#000',
                border:p===pref?'2px solid #000':'0',
                borderRadius:4,fontSize:'2.7vw'
              }}>{p}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
