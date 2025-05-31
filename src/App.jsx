import { useState, useEffect, useRef } from 'react';
import yamatoData   from './yamatoData.json';
import sagawaData   from './sagawaData.json';

/* ===== 定数 ===== */
const sizes = [
  60, 80, 100, 120, 140, 160, 170, 180,
  200, 220, 240, 260, 'パケット系'
];

const priceList = {
  'レターパックライト' : 430,
  'レターパックプラス' : 600,
  'クリックポスト'     : 185,
  'ネコポス'           : 385,
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
  { name:'関東',         list:['東京','茨城','栃木','群馬','埼玉','千葉','神奈川'] },
  { name:'中部',         list:['新潟','富山','石川','福井','山梨','長野','岐阜','静岡','愛知'] },
  { name:'近畿',         list:['大阪','三重','滋賀','京都','兵庫','奈良','和歌山'] },
  { name:'中国',         list:['鳥取','島根','岡山','広島','山口'] },
  { name:'四国',         list:['徳島','香川','愛媛','高知'] },
  { name:'九州沖縄',     list:['福岡','佐賀','長崎','熊本','大分','宮崎','鹿児島','沖縄'] },
];

/* ===== モバイル基準スタイル ===== */
const labelStyle = { display:'inline-block', width:'20vw', fontSize:'3.8vw', margin:'0 0 .5vh' };
const inputStyle = { width:'28%', padding:'.6vh 0', textAlign:'center',
                     fontSize:'16px', border:'1px solid #ccc', borderRadius:4 };

/* ===== メイン ===== */
export default function App() {
  const [size, setSize]     = useState(60);
  const [pref, setPref]     = useState(null);
  const [result, setResult] = useState(null);

  const [showCustom, setShowCustom] = useState(false);
  const [dims, setDims]             = useState({ l:'', w:'', h:'' });
  const [matches, setMatches]       = useState([]);

  const lRef = useRef(null);
  const wRef = useRef(null);
  const hRef = useRef(null);

  /* --- サイズ＋都道府県で料金比較 --- */
  useEffect(()=>{
    if(typeof size==='number' && pref){
      const y = yamatoData[size]?.[pref];
      const g = sagawaData[size]?.[pref];
      if (y==null && g==null){ setResult(null); return; }
      const cheapest =
        y==null ? '佐川' :
        g==null ? 'ヤマト' :
        y<g   ? 'ヤマト' :
        g<y   ? '佐川' : '同額';
      setResult({ size, prefecture:pref, yamato:y, sagawa:g, cheapest });
    }else{
      setResult(null);
    }
  },[size,pref]);

  /* --- パケット系判定 --- */
  useEffect(()=>{
    if(!showCustom){ setMatches([]); return; }
    const {l,w,h} = dims;
    if(!(l&&w&&h)){ setMatches([]); return; }

    const nums=[+l,+w,+h];
    const [a,b,c] = [...nums].sort((x,y)=>y-x);
    const sum = nums.reduce((p,n)=>p+n,0);
    const list=[];
    if(a<=34&&b<=25&&c<=3) list.push('レターパックライト','レターパックプラス','クリックポスト');
    if(a<=32&&b<=23&&c<=3) list.push('ネコポス');
    if((a<=25&&b<=20&&c<=5)||(a<=34&&b<=25&&c<=5)) list.push('宅急便コンパクト');
    if(sum<=60&&a<=34&&c<=3) list.push('ゆうパケット');
    if(a<=24&&b<=17&&c<=7)   list.push('ゆうパケットプラス');
    setMatches(list);
  },[dims,showCustom]);

  /* --- ハンドラ --- */
  const handleSize = s => { setSize(s); setShowCustom(s==='パケット系'); };
  const handlePref = p => setPref(p);

  const handleInput = k => e => {
    let v = e.target.value.replace(/\D/g,'');
    v = k==='h' ? v.slice(0,1) : v.slice(0,2);
    setDims(d => ({ ...d, [k]: v }));
  };

  /* iPhone「確定」(Enter) → 画面トップへ */
  const handleKey = nextRef => e => {
    if(e.key==='Enter'){
      e.preventDefault();
      if(nextRef?.current) nextRef.current.focus();
      window.scrollTo({ top:0, behavior:'smooth' });
    }
  };

  /* ===== JSX ===== */
  return (
    <>
      <style>{`
        @media (min-width:768px){
          .container {max-width:none;width:100%;font-size:15px;}
          .flex      {flex-wrap:nowrap;gap:12px;}
          .size-btn  {width:auto;padding:10px 16px;font-size:15px;}
          .pref-btn  {width:auto;padding:12px 18px;font-size:15px;}
          .label     {width:auto;font-size:17px;}
          .input     {width:120px;font-size:15px;}
        }
        .control-block{display:inline-block}
      `}</style>

      <div className="container" style={{
        maxWidth:420,width:'100%',padding:'1vh 2vw',
        fontFamily:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif'}}>

        <h1 style={{fontSize:'5.3vw',margin:'0 0 1vh'}}>送料比較ツール</h1>

        {/* ===== 結果 + サイズ ===== */}
        <div className="control-block">
          {/* 結果 */}
          <div style={{background:'#f0f0f0',padding:'1vh',minHeight:'8vh',
                       marginBottom:'1vh',fontSize:'3.6vw'}}>
            {showCustom ? (
              matches.length ? (()=>{const sorted=[...matches].sort((a,b)=>priceList[a]-priceList[b]);
                const cheapest=sorted[0];
                return(
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

          {/* サイズボタン（幅を 16% に縮小しグレー帯も短く） */}
          <p className="label" style={labelStyle}>サイズ：</p>
          <div className="flex" style={{display:'flex',flexWrap:'wrap',gap:'1.5vw',marginBottom:'1vh'}}>
            {sizes.map(s=>{
              const sel=s===size;
              return(
                <button key={s} onClick={()=>handleSize(s)}
                  className="size-btn"
                  style={{
                    width:'16%',padding:'.6vh 0',
                    background:sel?'#0070f3':'#eee',
                    color:sel?'#fff':'#000',
                    border:`2px solid ${sel?'#000':'transparent'}`,
                    borderRadius:4,fontSize:'3vw'
                  }}>{s}</button>
              );
            })}
          </div>
        </div>{/* control-block */}

        {/* ===== パケット系入力 ===== */}
        <div style={{minHeight:'6vh',visibility:showCustom?'visible':'hidden',marginBottom:'1vh'}}>
          <p className="label" style={labelStyle}>縦×横×厚み(cm)：</p>
          <div className="flex" style={{display:'flex',gap:'1vw'}}>
            <input ref={lRef} type="number" placeholder="縦" value={dims.l}
              onChange={handleInput('l')} onKeyDown={handleKey(wRef)}
              className="input" style={inputStyle}/>
            <input ref={wRef} type="number" placeholder="横" value={dims.w}
              onChange={handleInput('w')} onKeyDown={handleKey(hRef)}
              className="input" style={inputStyle}/>
            <input ref={hRef} type="number" placeholder="厚み" value={dims.h}
              onChange={handleInput('h')} onKeyDown={handleKey(null)}
              className="input" style={inputStyle}/>
          </div>
        </div>

        {/* ===== 都道府県 ===== */}
        <p className="label" style={labelStyle}>都道府県：</p>
        {regionGroups.map(({name,list})=>(
          <div key={name} style={{marginBottom:'1vh'}}>
            <div className="flex" style={{display:'flex',flexWrap:'wrap',gap:'1vw'}}>
              {list.map(p=>{
                const base=name.split('・')[0];
                let bg=regionColors[base]||'#ccc';
                if(p==='東京') bg=regionColors['中国'];
                if(p==='大阪') bg=regionColors['北海道'];
                const sel=p===pref;
                return(
                  <button key={p} onClick={()=>handlePref(p)}
                    className="pref-btn"
                    style={{
                      width:'18%',padding:'1.2vh 0',
                      background:bg,
                      color:sel?'#fff':'#000',
                      border:`2px solid ${sel?'#000':'transparent'}`,
                      borderRadius:4,fontSize:'2.7vw'
                    }}>{p}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
