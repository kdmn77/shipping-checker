import { useState, useEffect } from 'react';
import yamatoData from './yamatoData.json';
import sagawaData from './sagawaData.json';

/* ===== 定数 ===== */
const sizes = [
  60, 80, 100, 120, 140, 160, 170, 180,
  200, 220, 240, 260, 'パケット系'
];

/* 料金表（2025-05 時点） */
const priceList = {
  'レターパックライト' : 430,  // :contentReference[oaicite:0]{index=0}
  'レターパックプラス' : 600,  // :contentReference[oaicite:1]{index=1}
  'クリックポスト'     : 185,  // :contentReference[oaicite:2]{index=2}
  'ネコポス'           : 385,  // :contentReference[oaicite:3]{index=3}
  '宅急便コンパクト'   : 770,
  'ゆうパケット'       : 360,
  'ゆうパケットプラス' : 520,
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

/* ===== スタイル ===== */
const labelStyle = { display:'inline-block', width:'22vw', fontSize:'3.8vw', margin:'0 0 .5vh' };
const inputStyle = { width:'30%', padding:'.6vh 0', textAlign:'center',
                     fontSize:'16px', border:'1px solid #ccc', borderRadius:4 };

/* ===== コンポーネント ===== */
export default function App() {
  const [size, setSize] = useState(60);
  const [pref, setPref] = useState(null);
  const [result, setResult] = useState(null);

  const [showCustom, setShowCustom] = useState(false);
  const [dims, setDims] = useState({ l:'', w:'', h:'' });
  const [matches, setMatches] = useState([]);

  /* -------- 通常宅配比較 -------- */
  const compare = (p=pref, s=size)=>{
    if (typeof s!=='number'){ setResult(null); return; }
    const y=yamatoData[s]?.[p]; const g=sagawaData[s]?.[p];
    if (y==null && g==null){ setResult(null); return; }
    const cheapest = y==null?'佐川':g==null?'ヤマト':y<g?'ヤマト':g<y?'佐川':'同額';
    setResult({ size:s, prefecture:p, yamato:y, sagawa:g, cheapest });
  };

  /* -------- パケット系判定 -------- */
  useEffect(()=>{
    if(!showCustom){ setMatches([]); return; }
    const {l,w,h}=dims; if(!(l&&w&&h)){ setMatches([]); return; }

    const nums=[+l,+w,+h];
    const [a,b,c]=[...nums].sort((x,y)=>y-x);      // a:最長辺
    const sum=nums.reduce((p,n)=>p+n,0);
    const fits = [];

    // レターパックライト：34×25×3以内
    if(a<=34&&b<=25&&c<=3)               fits.push('レターパックライト');
    // レターパックプラス ：34×25以内（厚み制限なし）
    if(a<=34&&b<=25)                     fits.push('レターパックプラス');
    // クリックポスト      ：34×25×3以内
    if(a<=34&&b<=25&&c<=3)               fits.push('クリックポスト');
    // ネコポス            ：32×23×3以内
    if(a<=32&&b<=23&&c<=3)               fits.push('ネコポス');
    // 既存ゆうパケット系
    if((a<=25&&b<=20&&c<=5)||(a<=34&&b<=25&&c<=5)) fits.push('宅急便コンパクト');
    if(sum<=60&&a<=34&&c<=3)                         fits.push('ゆうパケット');
    if(a<=24&&b<=17&&c<=7)                           fits.push('ゆうパケットプラス');

    setMatches(fits);
  },[dims,showCustom]);

  /* -------- ハンドラ -------- */
  const handleSize = s=>{
    setSize(s);
    if(s==='パケット系'){ setShowCustom(true); setResult(null); }
    else{ setShowCustom(false); compare(pref,s); }
  };
  const handlePref = p=>{ setPref(p); compare(p,size); };
  const handleInput = k=>e=>{
    let v=e.target.value.replace(/\D/g,'');
    if(k==='h')v=v.slice(0,1); else v=v.slice(0,2);
    setDims(d=>({...d,[k]:v}));
  };

  /* -------- JSX -------- */
  return(
  <div style={{maxWidth:420,width:'100%',padding:'1vh 2vw',
               fontFamily:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif'}}>

    <h1 style={{fontSize:'5.3vw',margin:'0 0 1vh'}}>送料比較ツール</h1>

    {/* 結果表示 */}
    <div style={{background:'#f0f0f0',padding:'1vh',minHeight:'8vh',marginBottom:'1vh',fontSize:'3.6vw'}}>
      {showCustom ? (
        matches.length ? (()=>{   /* 安い順ソート＋最安強調 */
          const sorted=[...matches].sort((a,b)=>priceList[a]-priceList[b]);
          const cheapest=sorted[0];
          return (
            <>
              <div style={{fontWeight:'bold',fontSize:'4vw'}}>
                最安: {cheapest}（{priceList[cheapest].toLocaleString()}円）
              </div>
              <div style={{fontSize:'3.2vw'}}>
                {sorted.map(s=>`${s}: ${priceList[s].toLocaleString()}円`).join(' ／ ')}
              </div>
            </>
          );
        })() : <p style={labelStyle}>該当なし</p>
      ) : result ? (
        <>
          <div style={{fontWeight:'bold'}}>
            最安: {result.cheapest}（
            {result.cheapest==='ヤマト'
              ? result.yamato?.toLocaleString()
              : result.sagawa?.toLocaleString()
            }円／{result.size}／{result.prefecture}）
          </div>
          <div style={{fontSize:'3vw'}}>
            ヤマト: {result.yamato!=null?result.yamato.toLocaleString()+'円':'―円'}／
            佐川:   {result.sagawa!=null?result.sagawa.toLocaleString()+'円':'―円'}
          </div>
        </>
      ) : <p style={labelStyle}>サイズと都道府県を選択</p>}
    </div>

    {/* サイズ選択 */}
    <p style={labelStyle}>サイズ：</p>
    <div style={{display:'flex',flexWrap:'wrap',gap:'1vw',marginBottom:'1vh'}}>
      {sizes.map(s=>(
        <button key={s} onClick={()=>handleSize(s)} style={{
          width:'18%',padding:'.6vh 0',
          background:s===size?'#0070f3':'#eee',
          color:s===size?'#fff':'#000',
          border:0,borderRadius:4,fontSize:'3vw'
        }}>{s}</button>
      ))}
    </div>

    {/* パケット系入力 */}
    <div style={{minHeight:'6vh',visibility:showCustom?'visible':'hidden',marginBottom:'1vh'}}>
      <p style={labelStyle}>縦×横×厚み(cm)：</p>
      <div style={{display:'flex',gap:'1vw'}}>
        <input type="number" placeholder="縦" value={dims.l}
          onChange={handleInput('l')} style={inputStyle}/>
        <input type="number" placeholder="横" value={dims.w}
          onChange={handleInput('w')} style={inputStyle}/>
        <input type="number" placeholder="厚み" value={dims.h}
          onChange={handleInput('h')} style={inputStyle}/>
      </div>
    </div>

    {/* 都道府県 */}
    <p style={labelStyle}>都道府県：</p>
    {regionGroups.map(({name,list})=>(
      <div key={name} style={{marginBottom:'1vh'}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:'1vw'}}>
          {list.map(p=>{
            const base=name.split('・')[0];
            let bg=regionColors[base]||'#ccc';
            if(p==='東京') bg=regionColors['中国'];   // 東京:赤
            if(p==='大阪') bg=regionColors['北海道']; // 大阪:青
            return(
              <button key={p} onClick={()=>handlePref(p)} style={{
                width:'18%',padding:'.6vh 0',
                background:bg,
                color:p===pref?'#fff':'#000',
                border:p===pref?'2px solid #000':'0',
                borderRadius:4,fontSize:'2.7vw'
              }}>{p}</button>
            );
          })}
        </div>
      </div>
    ))}
  </div>);
}
