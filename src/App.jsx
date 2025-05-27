
import React, { useState } from "react";
import yamatoData from "./yamatoData.json";
import sagawaData from "./sagawaData.json";

const COLORS = {
  北海道: "#2196f3",
  青森: "#2196f3", 岩手: "#2196f3", 宮城: "#2196f3", 秋田: "#2196f3", 山形: "#2196f3", 福島: "#2196f3",
  茨城: "#ffeb3b", 栃木: "#ffeb3b", 群馬: "#ffeb3b", 埼玉: "#ffeb3b", 千葉: "#ffeb3b", 東京: "#f44336", 神奈川: "#ffeb3b",
  新潟: "#4caf50", 富山: "#4caf50", 石川: "#4caf50", 福井: "#4caf50", 山梨: "#4caf50", 長野: "#4caf50", 岐阜: "#4caf50", 静岡: "#4caf50", 愛知: "#4caf50",
  三重: "#03a9f4", 滋賀: "#03a9f4", 京都: "#03a9f4", 大阪: "#03a9f4", 兵庫: "#03a9f4", 奈良: "#03a9f4", 和歌山: "#03a9f4",
  鳥取: "#f44336", 島根: "#f44336", 岡山: "#f44336", 広島: "#f44336", 山口: "#f44336",
  徳島: "#ba68c8", 香川: "#ba68c8", 愛媛: "#ba68c8", 高知: "#ba68c8",
  福岡: "#f48fb1", 佐賀: "#f48fb1", 長崎: "#f48fb1", 熊本: "#f48fb1", 大分: "#f48fb1", 宮崎: "#f48fb1", 鹿児島: "#f48fb1", 沖縄: "#f48fb1",
};

const PREFS = Object.keys(COLORS);
const SIZES = [60, 80, 100, 120, 140, 160, 170, 180, 200, 220, 240, 260];

function App() {
  const [size, setSize] = useState(60);
  const [pref, setPref] = useState(null);

  const getPrice = (data, pref, size) => {
    const item = data.find((d) => d.pref === pref);
    return item && item.prices[String(size)];
  };

  const result =
    pref && size
      ? {
          yamato: getPrice(yamatoData, pref, size),
          sagawa: getPrice(sagawaData, pref, size),
        }
      : null;

  let cheapest = null;
  if (result?.yamato !== undefined || result?.sagawa !== undefined) {
    if (
      result.yamato !== undefined &&
      (result.sagawa === undefined || result.yamato <= result.sagawa)
    ) {
      cheapest = { service: "ヤマト", price: result.yamato };
    } else if (result.sagawa !== undefined) {
      cheapest = { service: "佐川", price: result.sagawa };
    }
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <h1>送料比較ツール</h1>

      <div
        style={{
          background: "#eee",
          padding: 20,
          minHeight: 80,
          marginBottom: 20,
        }}
      >
        {cheapest ? (
          <>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
              最安: {cheapest.service}（{cheapest.price.toLocaleString()}円／{size}／{pref}）
            </div>
            <div style={{ fontSize: "14px", marginTop: 4 }}>
              ヤマト:{" "}
              {result.yamato !== undefined
                ? result.yamato.toLocaleString() + "円"
                : "―円"}
              <br />
              佐川:{" "}
              {result.sagawa !== undefined
                ? result.sagawa.toLocaleString() + "円"
                : "―円"}
            </div>
          </>
        ) : (
          <div>サイズと都道府県を選ぶと、送料を表示します。</div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>サイズを選んでください：</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: s === size ? "#007bff" : "#eee",
                color: s === size ? "#fff" : "#000",
                fontWeight: s === size ? "bold" : "normal",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>都道府県を選んでください：</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PREFS.map((p) => (
            <button
              key={p}
              onClick={() => setPref(p)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border:
                  pref === p ? "2px solid #000" : "1px solid transparent",
                background: COLORS[p],
                color: "#fff",
                fontWeight: pref === p ? "bold" : "normal",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
