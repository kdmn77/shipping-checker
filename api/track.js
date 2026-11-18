// 問い合わせ番号をヤマト・佐川・日本郵便の追跡ページへ同時に照会し、
// 記録が見つかった会社と最新の配送状況を返す。
// 各社の公開ページを読み取っているため、先方のページ構成が変わると
// 判定できなくなることがある（その場合は error を返し、画面側は手動リンクに頼る）。

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function getHtml(url, init = {}, encoding = 'utf-8') {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'ja', ...(init.headers || {}) },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return new TextDecoder(encoding).decode(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

const strip = (s) =>
  (s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

function parseYamato(html) {
  const title = strip((html.match(/tracking-invoice-block-state-title[^>]*>([\s\S]*?)<\/h4>/) || [])[1]);
  const summary = strip((html.match(/tracking-invoice-block-state-summary[^>]*>([\s\S]*?)<\/div>/) || [])[1]);
  if (!title) throw new Error('ページを読み取れませんでした');
  const found = !/誤り|未登録|ありません|見つかりません/.test(title);
  return { found, status: title, detail: summary };
}

function parseSagawa(html) {
  const state = strip((html.match(/class="state"[^>]*>([\s\S]*?)<\/span>/) || [])[1]);
  if (!state) throw new Error('ページを読み取れませんでした');
  const found = !/該当なし/.test(state);
  return { found, status: state.replace(/^[↓⇒→\s]+/, ''), detail: '' };
}

function parseJapanPost(html) {
  if (/お問い合わせ番号が見つかりません/.test(html)) return { found: false, status: '該当なし', detail: '' };
  const table = (html.match(/summary="履歴情報"[\s\S]*?<\/table>/) || [])[0];
  if (!table) throw new Error('ページを読み取れませんでした');
  const cells = [...table.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => strip(m[1]));
  let status = '';
  let date = '';
  cells.forEach((c, i) => {
    if (/^\d{4}\/\d{2}\/\d{2}/.test(c) && cells[i + 1]) {
      date = c;
      status = cells[i + 1];
    }
  });
  return { found: true, status: status || '記録あり', detail: date };
}

const CARRIERS = [
  {
    carrier: 'ヤマト',
    run: (no) =>
      getHtml('https://toi.kuronekoyamato.co.jp/cgi-bin/tneko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'number00=1&number01=' + no,
      }).then(parseYamato),
  },
  {
    carrier: '佐川',
    run: (no) =>
      getHtml('https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=' + no, {}, 'shift_jis').then(parseSagawa),
  },
  {
    carrier: '日本郵便',
    run: (no) =>
      getHtml(
        'https://trackings.post.japanpost.jp/services/srv/search/direct?reqCodeNo1=' + no + '&searchKind=S002&locale=ja'
      ).then(parseJapanPost),
  },
];

module.exports = async (req, res) => {
  const no = String((req.query && req.query.no) || '').replace(/[^0-9A-Za-z]/g, '');
  res.setHeader('Cache-Control', 'no-store');
  if (no.length < 8 || no.length > 14) {
    res.status(400).json({ error: '問い合わせ番号は8〜14桁で入力してください' });
    return;
  }
  const results = await Promise.all(
    CARRIERS.map(({ carrier, run }) =>
      run(no)
        .then((r) => ({ carrier, ...r }))
        .catch((e) => ({ carrier, found: false, error: e.name === 'AbortError' ? '応答なし' : String(e.message || e) }))
    )
  );
  res.status(200).json({ number: no, results });
};

module.exports.parsers = { parseYamato, parseSagawa, parseJapanPost };
