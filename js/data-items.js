const ITEM_DATA = [
  { area: "マサラタウン", items: [
    { id: "ma01", name: "タウンマップ",                    type: "gift",   note: "ライバルの家でグリーン（リーフ）から" },
  ]},
  { area: "1番道路・2番道路", items: [
    { id: "r001", name: "きずぐすり",                      type: "field",  note: "1番道路 草むら北" },
    { id: "r002", name: "ひでんマシン05 フラッシュ",       type: "hm",     note: "2番道路ゲート（木を切った先）でオーキド助手から（図鑑10匹以上）" },
  ]},
  { area: "ニビシティ", items: [
    { id: "ni01", name: "ランニングシューズ",               type: "gift",   note: "タケシ撃破後、ニビシティ右出口でオーキド博士の助手から" },
    { id: "ni02", name: "わざマシン39 がんせきふうじ",         type: "tm",     note: "タケシ撃破後にもらえる" },
    { id: "ni03", name: "ふしぎなアメ",                    type: "hidden", note: "ニビはくぶつかん裏（ダウジングマシン）" },
    { id: "ni04", name: "ひみつのコハク",                  type: "gift",   note: "ニビはくぶつかん 制限区域の科学者（いあいぎり使用後）→ グレンじま研究所でプテラに復元" },
  ]},
  { area: "おつきみやま", items: [
    { id: "oz01", name: "つきのいし",                      type: "hidden", note: "B2F（ダウジングマシンで発見）" },
    { id: "oz02", name: "かいのカセキ または こうらのカセキ", type: "field",  note: "B2Fで片方選択（グレンじまの研究所で復元）" },
    { id: "oz03", name: "わざマシン46 どろぼう",            type: "field",  note: "おつきみやまB2F" },
    { id: "oz04", name: "ふしぎなアメ", type: "field",  note: "おつきみやま1F（アイテムボール）",                           img: "https://appmedia.jp/wp-content/uploads/2026/03/143032_4efry.webp" },
  ]},
  { area: "ハナダシティ", items: [
    { id: "ha01", name: "わざマシン03 みずのはどう",        type: "tm",     note: "カスミ撃破後にもらえる" },
    { id: "ha02", name: "ふしぎなアメ", type: "hidden", note: "ハナダシティ（ダウジングマシンで発見）",                   img: "https://appmedia.jp/wp-content/uploads/2026/03/135513_4nhoj.webp" },
  ]},
  { area: "6番道路", items: [
    { id: "r06a", name: "ふしぎなアメ", type: "hidden", note: "6番道路（ダウジングマシンで発見）",                        img: "https://appmedia.jp/wp-content/uploads/2026/03/140021_6d8kl.webp" },
  ]},
  { area: "SSアン（クチバシティ）", items: [
    { id: "ss01", name: "ひでんマシン01 いあいぎり",        type: "hm",     note: "B1F 船長の部屋（肩もみ後）" },
  ]},
  { area: "クチバシティ", items: [
    { id: "ku01", name: "わざマシン34 でんきショック",     type: "tm",     note: "マチス撃破後にもらえる" },
    { id: "ku02", name: "ひきかえけん",                    type: "gift",   note: "クチバ ポケモンファンクラブ会長から（話を聞くだけ）" },
  ]},
  { area: "11番道路", items: [
    { id: "r11a", name: "ダウジングマシン",                type: "gift",   note: "クチバシティ側ゲート2F・オーキド博士の助手（図鑑30匹以上）" },
  ]},
  { area: "9番道路", items: [
    { id: "r09a", name: "ふしぎなアメ", type: "hidden", note: "9番道路（ダウジングマシンで発見）",                        img: "https://appmedia.jp/wp-content/uploads/2026/03/140028_r8qxy.webp" },
  ]},
  { area: "10番道路", items: [
    { id: "r10a", name: "かわらずのいし",                  type: "gift",   note: "10番道路ポケモンセンター（イワヤマトンネル付近）・オーキド博士の助手（図鑑20匹以上）" },
  ]},
  { area: "12〜15番道路", items: [
    { id: "r12a", name: "ちいさなキノコ",                  type: "hidden", note: "12番道路（ダウジングマシン）" },
    { id: "r12b", name: "わざマシン48 スキルスワップ",         type: "field",  note: "12番道路" },
    { id: "r12c", name: "ふしぎなアメ", type: "hidden", note: "12番道路（ダウジングマシンで発見）",                       img: "https://appmedia.jp/wp-content/uploads/2026/03/140044_jxf32.webp" },
    { id: "r15a", name: "がくしゅうそうち",                type: "gift",   note: "15番道路 東ゲート2F・オーキド博士の助手（図鑑50匹以上）" },
  ]},
  { area: "16〜17番道路（サイクリングロード）", items: [
    { id: "r16a", name: "ひでんマシン02 そらをとぶ",        type: "hm",     note: "16番道路・木を切った先の建物のNPCから" },
    { id: "r16b", name: "たべのこし",                      type: "field",  note: "カビゴン（12番道路）を撃破/捕獲後に入手可（要確認）" },
    { id: "r16c", name: "おまもりこばん",                  type: "gift",   note: "16番道路ゲート タマムシシティ側2F・オーキド博士の助手（図鑑40匹以上）" },
    { id: "r17a", name: "ふしぎなアメ", type: "hidden", note: "17番道路・サイクリングロード（ダウジングマシンで発見）",    img: "https://appmedia.jp/wp-content/uploads/2026/03/140035_58qiv.webp" },
  ]},
  { area: "タマムシシティ", items: [
    { id: "ta01", name: "わざマシン19 ギガドレイン",       type: "tm",     note: "エリカ撃破後にもらえる" },
    { id: "ta02", name: "シルフスコープ",                   type: "gift",   note: "ゲームコーナー地下ロケット団アジトでサカキ撃破後" },
    { id: "ta03", name: "わざマシン12 ちょうはつ",          type: "field",  note: "ゲームコーナー地下ロケット団アジト（落ちているアイテム）" },
    { id: "ta04", name: "わざマシン23 アイアンテール",     type: "tm",     note: "ゲームコーナー 3500コイン" },
    { id: "ta05", name: "わざマシン13 れいとうビーム",     type: "tm",     note: "ゲームコーナー 4000コイン" },
    { id: "ta06", name: "わざマシン24 10まんボルト",        type: "tm",     note: "ゲームコーナー 4000コイン" },
    { id: "ta07", name: "わざマシン35 かえんほうしゃ",     type: "tm",     note: "ゲームコーナー 4000コイン" },
    { id: "ta08", name: "わざマシン30 シャドーボール",     type: "tm",     note: "ゲームコーナー 4500コイン" },
    { id: "ta09", name: "わざマシン15 はかいこうせん",     type: "field",  note: "タマムシデパート 4F（7500円）" },
    { id: "ta10", name: "ふしぎなアメ", type: "field",  note: "ゲームコーナー地下ロケット団アジトB3F（アイテムボール）",    img: "https://appmedia.jp/wp-content/uploads/2026/03/143043_kcho1.webp" },
  ]},
  { area: "シオンタウン", items: [
    { id: "la01", name: "ポケモンのふえ",                  type: "gift",   note: "ポケモンタワー頂上でフジ老人を救出後" },
    { id: "la02", name: "ふしぎなアメ", type: "field",  note: "ポケモンタワー6F（アイテムボール）",                         img: "https://appmedia.jp/wp-content/uploads/2026/03/143057_aodly.webp" },
  ]},
  { area: "ヤマブキシティ", items: [
    { id: "ya01", name: "マスターボール",                  type: "gift",   note: "シルフカンパニー11Fでサカキ撃破後、社長から" },
    { id: "ya02", name: "ラプラス",                        type: "gift",   note: "シルフカンパニー7Fの男性社員から（制覇後）" },
    { id: "ya03", name: "わざマシン04 めいそう",           type: "tm",     note: "ナツメ撃破後にもらえる" },
    { id: "ya04", name: "わざマシン01 きあいパンチ",        type: "field",  note: "ヤマブキシルフカンパニー（落ちているアイテム）" },
    { id: "ya05", name: "ふしぎなアメ", type: "field",  note: "シルフカンパニー10F（アイテムボール）",                      img: "https://appmedia.jp/wp-content/uploads/2026/03/143114_3kf5j.webp" },
  ]},
  { area: "セキチクシティ・サファリゾーン", items: [
    { id: "se01", name: "わざマシン06 どくどく",           type: "tm",     note: "キョウ撃破後にもらえる" },
    { id: "se02", name: "ひでんマシン03 なみのり",         type: "hm",     note: "サファリゾーン 秘密の家" },
    { id: "se03", name: "きんのいれば（金歯）",            type: "field",  note: "サファリゾーン 東エリア（かいりき入手のために必要）" },
    { id: "se04", name: "ひでんマシン04 かいりき",         type: "hm",     note: "サファリゾーン管理人へきんのいればを渡す" },
    { id: "se05", name: "ふしぎなアメ", type: "field",  note: "セキチクシティ 動物園の園長の家（かいりきが必要）",           img: "https://appmedia.jp/wp-content/uploads/2026/03/143105_szgyi.webp" },
  ]},
  { area: "グレンじま・グレンタウン", items: [
    { id: "gr01", name: "わざマシン38 だいもんじ",         type: "tm",     note: "カツラ撃破後にもらえる" },
    { id: "gr02", name: "ファイヤー",                      type: "field",  note: "グレンじま 洞窟奥（1匹のみ）" },
    { id: "gr03", name: "プテラ（ひみつのコハク復元）",    type: "gift",   note: "グレンじま研究所（ひみつのコハク持参）" },
    { id: "gr04", name: "オムスター または カブトプス（化石復元）", type: "gift", note: "グレンじま研究所（かいのカセキ または こうらのカセキを持参）" },
    { id: "gr05", name: "ふしぎなアメ", type: "hidden", note: "ポケモン屋敷3F（ダウジングマシンで発見）",                 img: "https://appmedia.jp/wp-content/uploads/2026/03/140053_dy9g3.webp" },
  ]},
  { area: "トキワシティ（ジム）", items: [
    { id: "to01", name: "わざマシン26 じしん",             type: "tm",     note: "サカキ撃破後にもらえる" },
  ]},
  { area: "22〜23番道路・はつでんしょ", items: [
    { id: "r23a", name: "サンダー",                        type: "field",  note: "はつでんしょ B1F（1匹のみ）" },
  ]},
  { area: "チャンピオンロード", items: [
    { id: "ch01", name: "ひでんマシン06 いわくだき",         type: "hm",     note: "チャンピオンロード内（落ちているアイテム）" },
    { id: "ch02", name: "ふしぎなアメ", type: "field",  note: "チャンピオンロード1F（アイテムボール）",                      img: "https://appmedia.jp/wp-content/uploads/2026/03/143122_gc2q4.webp" },
  ]},
  { area: "ハナダの洞窟（クリア後）", items: [
    { id: "ce01", name: "フリーザー",                      type: "field",  note: "ハナダの洞窟 B4F（1匹のみ）" },
    { id: "ce02", name: "ミュウツー",                      type: "field",  note: "ハナダの洞窟 最深部（1匹のみ）" },
  ]},
  { area: "7の島（クリア後）", items: [
    { id: "sv01", name: "ひでんマシン07 たきのぼり",          type: "hm",     note: "7の島" },
    { id: "sv02", name: "ふしぎなアメ", type: "field",  note: "かえらずのあな（アイテムボール）",                           img: "https://appmedia.jp/wp-content/uploads/2026/03/143130_0jao4.webp" },
  ]},
  { area: "2の島（クリア後）", items: [
    { id: "si01", name: "ふしぎなアメ", type: "hidden", note: "きわのみさき・わざおしえの家の裏（ダウジングマシンで発見）", img: "https://appmedia.jp/wp-content/uploads/2026/03/140110_o4sfg.webp" },
  ]},
];

const LOCATION_DATA = [
  // ─── マサラタウン → トキワシティ ───
  { name: "1番道路", ver: "", pokemon: [
    { name: "ポッポ",     evs: { spe: 1 }, rate: "50%" },
    { name: "コラッタ",   evs: { spe: 1 }, rate: "50%" },
  ]},
  { name: "2番道路", ver: "", pokemon: [
    { name: "ポッポ",     evs: { spe: 1 }, rate: "45%" },
    { name: "コラッタ",   evs: { spe: 1 }, rate: "45%" },
    { name: "キャタピー", evs: { hp: 1 },  rate: "5%",  ver: "FR" },
    { name: "ビードル",   evs: { spe: 1 }, rate: "5%",  ver: "LG" },
  ]},
  { name: "22番道路（草むら）", ver: "", pokemon: [
    { name: "マンキー",   evs: { atk: 1 }, rate: "45%", best: true },
    { name: "コラッタ",   evs: { spe: 1 }, rate: "45%" },
    { name: "オニスズメ", evs: { spe: 1 }, rate: "10%" },
  ]},
  // ─── ニビシティ → ハナダシティ（おつきみやま経由） ───
  { name: "3番道路", ver: "", pokemon: [
    { name: "オニスズメ", evs: { spe: 1 }, rate: "35%" },
    { name: "ポッポ",     evs: { spe: 1 }, rate: "30%" },
    { name: "マンキー",   evs: { atk: 1 }, rate: "10%" },
    { name: "プリン",     evs: { hp: 2 },  rate: "10%" },
    { name: "ニドラン♂",  evs: { atk: 1 }, rate: "14%", ver: "FR" },
    { name: "ニドラン♀",  evs: { hp: 1 },  rate: "14%", ver: "LG" },
  ]},
  { name: "おつきみやま 1F", ver: "", pokemon: [
    { name: "ズバット",   evs: { spe: 1 }, rate: "69%", best: true },
    { name: "イシツブテ", evs: { def: 1 }, rate: "25%" },
    { name: "パラス",     evs: { atk: 1 }, rate: "5%" },
    { name: "ピッピ",     evs: { hp: 2 },  rate: "1%" },
  ]},
  { name: "おつきみやま B1F", ver: "", pokemon: [
    { name: "パラス",     evs: { atk: 1 }, rate: "100%", best: true },
  ]},
  { name: "おつきみやま B2F", ver: "", pokemon: [
    { name: "ズバット",   evs: { spe: 1 }, rate: "49%" },
    { name: "イシツブテ", evs: { def: 1 }, rate: "30%" },
    { name: "パラス",     evs: { atk: 1 }, rate: "15%" },
    { name: "ピッピ",     evs: { hp: 2 },  rate: "6%" },
  ]},
  { name: "4番道路", ver: "", pokemon: [
    { name: "コラッタ",   evs: { spe: 1 }, rate: "35%" },
    { name: "オニスズメ", evs: { spe: 1 }, rate: "35%" },
    { name: "アーボ",     evs: { atk: 1 }, rate: "25%", ver: "FR" },
    { name: "サンド",     evs: { def: 1 }, rate: "25%", ver: "LG" },
    { name: "マンキー",   evs: { atk: 1 }, rate: "5%" },
  ]},
  // ─── ハナダシティ周辺 ───
  { name: "24・25番道路", ver: "", pokemon: [
    { name: "ポッポ",     evs: { spe: 1 }, rate: "15%" },
    { name: "キャタピー", evs: { hp: 1 },  rate: "20%", ver: "FR" },
    { name: "トランセル", evs: { def: 2 }, rate: "4%",  ver: "FR" },
    { name: "ビードル",   evs: { spe: 1 }, rate: "20%", ver: "LG" },
    { name: "コクーン",   evs: { def: 2 }, rate: "4%",  ver: "LG" },
    { name: "ナゾノクサ", evs: { spa: 1 }, rate: "25%", ver: "FR" },
    { name: "マダツボミ", evs: { atk: 1 }, rate: "25%", ver: "LG" },
    { name: "ケーシィ",   evs: { spa: 1 }, rate: "15%" },
  ]},
  // ─── クチバシティ方面 ───
  { name: "5番道路", ver: "", pokemon: [
    { name: "ポッポ",     evs: { spe: 1 }, rate: "40%" },
    { name: "ニャース",   evs: { spe: 1 }, rate: "35%" },
    { name: "ナゾノクサ", evs: { spa: 1 }, rate: "25%", ver: "FR" },
    { name: "マダツボミ", evs: { atk: 1 }, rate: "25%", ver: "LG" },
  ]},
  { name: "6番道路", ver: "", pokemon: [
    { name: "ポッポ",     evs: { spe: 1 }, rate: "40%" },
    { name: "ニャース",   evs: { spe: 1 }, rate: "35%" },
    { name: "ナゾノクサ", evs: { spa: 1 }, rate: "25%", ver: "FR" },
    { name: "マダツボミ", evs: { atk: 1 }, rate: "25%", ver: "LG" },
  ]},
  { name: "ディグダのあな", ver: "", pokemon: [
    { name: "ディグダ",   evs: { spe: 1 }, rate: "95%", best: true },
    { name: "ダグトリオ", evs: { spe: 2 }, rate: "5%" },
  ]},
  // ─── クチバシティ東 → シオンタウン方面 ───
  { name: "11番道路", ver: "", pokemon: [
    { name: "アーボ",     evs: { atk: 1 }, rate: "40%", ver: "FR" },
    { name: "サンド",     evs: { def: 1 }, rate: "40%", ver: "LG", best: true },
    { name: "オニスズメ", evs: { spe: 1 }, rate: "35%" },
    { name: "スリープ",   evs: { spd: 1 }, rate: "25%" },
  ]},
  { name: "12番道路", ver: "", pokemon: [
    { name: "ナゾノクサ", evs: { spa: 1 }, rate: "35%", ver: "FR" },
    { name: "マダツボミ", evs: { atk: 1 }, rate: "35%", ver: "LG" },
    { name: "コンパン",   evs: { spd: 1 }, rate: "30%" },
    { name: "ポッポ",     evs: { spe: 1 }, rate: "30%" },
    { name: "クサイハナ", evs: { spa: 2 }, rate: "5%",  ver: "FR" },
    { name: "ウツドン",   evs: { atk: 2 }, rate: "5%",  ver: "LG" },
  ]},
  { name: "13番道路", ver: "", pokemon: [
    { name: "ナゾノクサ", evs: { spa: 1 }, rate: "35%", ver: "FR" },
    { name: "マダツボミ", evs: { atk: 1 }, rate: "35%", ver: "LG" },
    { name: "コンパン",   evs: { spd: 1 }, rate: "30%" },
    { name: "ポッポ",     evs: { spe: 1 }, rate: "20%" },
    { name: "クサイハナ", evs: { spa: 2 }, rate: "5%",  ver: "FR" },
    { name: "ウツドン",   evs: { atk: 2 }, rate: "5%",  ver: "LG" },
    { name: "ピジョン",   evs: { spe: 2 }, rate: "5%" },
    { name: "メタモン",   evs: { hp: 1 },  rate: "5%" },
  ]},
  { name: "14番道路", ver: "", pokemon: [
    { name: "ナゾノクサ", evs: { spa: 1 }, rate: "35%", ver: "FR" },
    { name: "マダツボミ", evs: { atk: 1 }, rate: "35%", ver: "LG" },
    { name: "コンパン",   evs: { spd: 1 }, rate: "30%" },
    { name: "メタモン",   evs: { hp: 1 },  rate: "15%" },
    { name: "クサイハナ", evs: { spa: 2 }, rate: "5%",  ver: "FR" },
    { name: "ウツドン",   evs: { atk: 2 }, rate: "5%",  ver: "LG" },
    { name: "ポッポ",     evs: { spe: 1 }, rate: "10%" },
    { name: "ピジョン",   evs: { spe: 2 }, rate: "5%" },
  ]},
  { name: "15番道路", ver: "", pokemon: [
    { name: "ナゾノクサ", evs: { spa: 1 }, rate: "35%", ver: "FR" },
    { name: "マダツボミ", evs: { atk: 1 }, rate: "35%", ver: "LG" },
    { name: "コンパン",   evs: { spd: 1 }, rate: "30%" },
    { name: "ポッポ",     evs: { spe: 1 }, rate: "20%" },
    { name: "クサイハナ", evs: { spa: 2 }, rate: "5%",  ver: "FR" },
    { name: "ウツドン",   evs: { atk: 2 }, rate: "5%",  ver: "LG" },
    { name: "ピジョン",   evs: { spe: 2 }, rate: "5%" },
    { name: "メタモン",   evs: { hp: 1 },  rate: "5%" },
  ]},
  // ─── タマムシシティ方面 ───
  { name: "7番道路", ver: "", pokemon: [
    { name: "ニャース",   evs: { spe: 1 }, rate: "40%" },
    { name: "ポッポ",     evs: { spe: 1 }, rate: "30%" },
    { name: "ナゾノクサ", evs: { spa: 1 }, rate: "20%", ver: "FR" },
    { name: "ガーディ",   evs: { atk: 1 }, rate: "10%", ver: "FR" },
    { name: "マダツボミ", evs: { atk: 1 }, rate: "20%", ver: "LG" },
    { name: "ロコン",     evs: { spe: 1 }, rate: "10%", ver: "LG" },
  ]},
  { name: "8番道路", ver: "", pokemon: [
    { name: "ニャース",   evs: { spe: 1 }, rate: "30%" },
    { name: "ピジョン",   evs: { spe: 2 }, rate: "30%" },
    { name: "アーボ",     evs: { atk: 1 }, rate: "20%", ver: "FR" },
    { name: "ガーディ",   evs: { atk: 1 }, rate: "20%", ver: "FR" },
    { name: "サンドパン", evs: { def: 2 }, rate: "20%", ver: "LG" },
    { name: "ロコン",     evs: { spe: 1 }, rate: "20%", ver: "LG" },
    { name: "ケーシィ",   evs: { spa: 1 }, rate: "15%" },
    { name: "ユンゲラー", evs: { spa: 2 }, rate: "5%" },
  ]},
  // ─── シオンタウン → 岩山の洞窟 ───
  { name: "9番道路", ver: "", pokemon: [
    { name: "コラッタ",   evs: { spe: 1 }, rate: "40%" },
    { name: "オニスズメ", evs: { spe: 1 }, rate: "35%" },
    { name: "アーボ",     evs: { atk: 1 }, rate: "25%", ver: "FR" },
    { name: "サンド",     evs: { def: 1 }, rate: "25%", ver: "LG" },
  ]},
  { name: "10番道路", ver: "", pokemon: [
    { name: "ビリリダマ", evs: { spe: 1 }, rate: "40%", best: true },
    { name: "オニスズメ", evs: { spe: 1 }, rate: "35%" },
    { name: "アーボ",     evs: { atk: 1 }, rate: "25%", ver: "FR" },
    { name: "サンド",     evs: { def: 1 }, rate: "25%", ver: "LG" },
  ]},
  { name: "岩山の洞窟 1F", ver: "", pokemon: [
    { name: "イシツブテ", evs: { def: 1 }, rate: "35%", best: true },
    { name: "ズバット",   evs: { spe: 1 }, rate: "30%" },
    { name: "マンキー",   evs: { atk: 1 }, rate: "15%" },
    { name: "ワンリキー", evs: { atk: 1 }, rate: "15%" },
    { name: "イワーク",   evs: { def: 2 }, rate: "5%" },
  ]},
  { name: "岩山の洞窟 B1F", ver: "", pokemon: [
    { name: "イシツブテ", evs: { def: 1 }, rate: "35%", best: true },
    { name: "ズバット",   evs: { spe: 1 }, rate: "30%" },
    { name: "マンキー",   evs: { atk: 1 }, rate: "15%" },
    { name: "ワンリキー", evs: { atk: 1 }, rate: "10%" },
    { name: "イワーク",   evs: { def: 2 }, rate: "10%" },
  ]},
  // ─── シオンタウン → ポケモンタワー ───
  { name: "ポケモンタワー 3F", ver: "", pokemon: [
    { name: "ゴース",   evs: { spa: 1 }, rate: "90%", best: true },
    { name: "ガラガラ", evs: { def: 2 }, rate: "9%" },
    { name: "ゴースト", evs: { spa: 2 }, rate: "1%" },
  ]},
  { name: "ポケモンタワー 4〜5F", ver: "", pokemon: [
    { name: "ゴース",   evs: { spa: 1 }, rate: "86%", best: true },
    { name: "ガラガラ", evs: { def: 2 }, rate: "9%" },
    { name: "ゴースト", evs: { spa: 2 }, rate: "5%" },
  ]},
  { name: "ポケモンタワー 6F", ver: "", pokemon: [
    { name: "ゴース",   evs: { spa: 1 }, rate: "85%", best: true },
    { name: "ガラガラ", evs: { def: 2 }, rate: "9%" },
    { name: "ゴースト", evs: { spa: 2 }, rate: "6%" },
  ]},
  { name: "ポケモンタワー 7F", ver: "", pokemon: [
    { name: "ゴース",   evs: { spa: 1 }, rate: "75%" },
    { name: "ガラガラ", evs: { def: 2 }, rate: "10%" },
    { name: "ゴースト", evs: { spa: 2 }, rate: "15%" },
  ]},
  // ─── セキチクシティ方面（サイクリングロード） ───
  { name: "16番道路", ver: "", pokemon: [
    { name: "ドードー",   evs: { atk: 1 }, rate: "35%", best: true },
    { name: "コラッタ",   evs: { spe: 1 }, rate: "30%" },
    { name: "オニスズメ", evs: { spe: 1 }, rate: "30%" },
    { name: "ラッタ",     evs: { spe: 2 }, rate: "5%" },
  ]},
  { name: "17番道路", ver: "", note: "サイクリングロード", pokemon: [
    { name: "ドードー",   evs: { atk: 1 }, rate: "35%", best: true },
    { name: "オニドリル", evs: { spe: 2 }, rate: "30%" },
    { name: "ラッタ",     evs: { spe: 2 }, rate: "25%" },
    { name: "コラッタ",   evs: { spe: 1 }, rate: "10%" },
  ]},
  { name: "18番道路", ver: "", pokemon: [
    { name: "ドードー",   evs: { atk: 1 }, rate: "35%", best: true },
    { name: "オニスズメ", evs: { spe: 1 }, rate: "30%" },
    { name: "オニドリル", evs: { spe: 2 }, rate: "15%" },
    { name: "ラッタ",     evs: { spe: 2 }, rate: "15%" },
    { name: "コラッタ",   evs: { spe: 1 }, rate: "5%" },
  ]},
  // ─── なみのり解放後 ───
  { name: "4・10〜13番道路（なみのり）", ver: "", pokemon: [
    { name: "メノクラゲ", evs: { spd: 1 }, rate: "100%", best: true },
  ]},
  { name: "6・22・23番道路（なみのり）", ver: "FR", pokemon: [
    { name: "コダック", evs: { spa: 1 }, rate: "100%", best: true },
  ]},
  { name: "6・22・23番道路（なみのり）", ver: "LG", pokemon: [
    { name: "ヤドン", evs: { hp: 1 }, rate: "100%", best: true },
  ]},
  { name: "19〜21番道路（なみのり）", ver: "", pokemon: [
    { name: "メノクラゲ", evs: { spd: 1 }, rate: "100%", best: true },
  ]},
  { name: "ふたごじま 1F", ver: "", pokemon: [
    { name: "コダック",   evs: { spa: 1 }, rate: "55%", ver: "FR" },
    { name: "ヤドン",     evs: { hp: 1 },  rate: "55%", ver: "LG" },
    { name: "ズバット",   evs: { spe: 1 }, rate: "34%" },
    { name: "ゴルバット", evs: { spe: 2 }, rate: "11%" },
  ]},
  { name: "ふたごじま B1F", ver: "", pokemon: [
    { name: "コダック",   evs: { spa: 1 }, rate: "40%", ver: "FR" },
    { name: "ヤドン",     evs: { hp: 1 },  rate: "40%", ver: "LG" },
    { name: "ズバット",   evs: { spe: 1 }, rate: "34%" },
    { name: "ゴルバット", evs: { spe: 2 }, rate: "11%" },
    { name: "パウワウ",   evs: { spd: 1 }, rate: "10%" },
    { name: "ゴルダック", evs: { spa: 2 }, rate: "5%",  ver: "FR" },
    { name: "ヤドラン",   evs: { def: 2 }, rate: "5%",  ver: "LG" },
  ]},
  { name: "21番道路（草むら）", ver: "", pokemon: [
    { name: "モンジャラ", evs: { def: 1 }, rate: "100%", best: true },
  ]},
  // ─── グレン島 ───
  { name: "はつでんしょ", ver: "", pokemon: [
    { name: "ビリリダマ", evs: { spe: 1 }, rate: "40%", best: true },
    { name: "コイル",     evs: { spa: 1 }, rate: "35%" },
    { name: "レアコイル", evs: { spa: 2 }, rate: "20%" },
    { name: "マルマイン", evs: { spe: 2 }, rate: "4%" },
    { name: "エレブー",   evs: { spe: 2 }, rate: "1%",  ver: "FR" },
  ]},
  // ─── エンディング前 ───
  { name: "23番道路", ver: "", pokemon: [
    { name: "マンキー",   evs: { atk: 1 }, rate: "30%" },
    { name: "オニドリル", evs: { spe: 2 }, rate: "25%" },
    { name: "アーボ",     evs: { atk: 1 }, rate: "20%", ver: "FR" },
    { name: "サンド",     evs: { def: 1 }, rate: "20%", ver: "LG" },
    { name: "オニスズメ", evs: { spe: 1 }, rate: "15%" },
    { name: "アーボック", evs: { atk: 2 }, rate: "5%",  ver: "FR" },
    { name: "サンドパン", evs: { def: 2 }, rate: "5%",  ver: "LG" },
    { name: "オコリザル", evs: { atk: 2 }, rate: "5%" },
  ]},
  { name: "チャンピオンロード 1F・3F", ver: "", pokemon: [
    { name: "イワーク",   evs: { def: 2 }, rate: "30%" },
    { name: "イシツブテ", evs: { def: 1 }, rate: "20%" },
    { name: "ワンリキー", evs: { atk: 1 }, rate: "20%" },
    { name: "ズバット",   evs: { spe: 1 }, rate: "10%" },
    { name: "ガラガラ",   evs: { def: 2 }, rate: "5%" },
    { name: "ゴーリキー", evs: { atk: 2 }, rate: "5%" },
    { name: "アーボック", evs: { atk: 2 }, rate: "5%" },
    { name: "サンドパン", evs: { def: 2 }, rate: "5%" },
    { name: "ゴルバット", evs: { spe: 2 }, rate: "5%" },
  ]},
  { name: "チャンピオンロード 2F", ver: "", pokemon: [
    { name: "イワーク",   evs: { def: 2 }, rate: "20%" },
    { name: "イシツブテ", evs: { def: 1 }, rate: "20%" },
    { name: "ワンリキー", evs: { atk: 1 }, rate: "20%" },
    { name: "オコリザル", evs: { atk: 2 }, rate: "10%" },
    { name: "ズバット",   evs: { spe: 1 }, rate: "10%" },
    { name: "ゴーリキー", evs: { atk: 2 }, rate: "5%" },
    { name: "アーボック", evs: { atk: 2 }, rate: "5%" },
    { name: "サンドパン", evs: { def: 2 }, rate: "5%" },
    { name: "ガラガラ",   evs: { def: 2 }, rate: "5%" },
    { name: "ゴルバット", evs: { spe: 2 }, rate: "5%" },
  ]},
  // ─── クリア後（島） ───
  { name: "廃虚の谷（なみのり）", ver: "FR", note: "1番島・島4解放後", pokemon: [
    { name: "マリル", evs: { hp: 2 }, rate: "100%", best: true },
  ]},
];

// FR/LG フィールドアイテム・もらいものチェックリスト（Bulbapedia確認済み）
// type: "field"=拾う / "gift"=もらう / "gym"=ジム制覇 / "hidden"=隠し（ダウジングマシン）
const FIELD_ITEMS = [
  { area: "マサラタウン", items: [
    { id:"m01", name:"タウンマップ", type:"gift", note:"自宅2F・姉デイジーからもらう" },
  ]},
  { area: "2番道路（東ゲート）", items: [
    { id:"r2_01", name:"ひでんマシン05（フラッシュ）", type:"gift", note:"2番道路東ゲート内・オーキドの助手（ポケモンを10種類以上捕まえた後）" },
  ]},
  { area: "ニビシティ・ニビのはくぶつかん", items: [
    { id:"nv01", name:"わざマシン39（がんせきふうじ）", type:"gym",  note:"ニビジム・タケシを倒す" },
    { id:"nv02", name:"ひみつのコハク", type:"gift",              note:"ニビのはくぶつかん・制限区域の科学者（いあいぎり必要）→ グレンじま研究所でプテラに復元" },
    { id:"nv03", name:"ふしぎなアメ", type:"hidden",              note:"ニビのはくぶつかん裏・ダウジングマシンを使用して発見" },
  ]},
  { area: "おつきみやま", items: [
    { id:"ot01", name:"わざマシン09（タネマシンガン）", type:"field",    note:"おつきみやま1F・アイテムボール" },
    { id:"ot02", name:"スターのかけら", type:"field",                     note:"おつきみやまB2F・アイテムボール（ロケット団員エリア東の高台）" },
    { id:"ot03", name:"わざマシン46（どろぼう）", type:"field",          note:"おつきみやまB2F・アイテムボール" },
    { id:"ot04", name:"かいのカセキ または こうらのカセキ", type:"gift", note:"おつきみやまB2F・スーパーオタクを倒した後どちらか1つ選択（かいのカセキ→オムナイト、こうらのカセキ→カブト）→ グレンじま研究所で復元" },
    { id:"ot05", name:"つきのいし", type:"hidden",                      note:"おつきみやまB2F・ダウジングマシンを使用して発見" },
  ]},
  { area: "ハナダシティ周辺", items: [
    { id:"hd01", name:"わざマシン28（あなをほる）", type:"gift", note:"ハナダシティ・ロケット団員を倒した後にもらう" },
    { id:"hd02", name:"SSアンのチケット", type:"gift",           note:"ルート25・ビルの家 ビルから（ポケモン変身解除の手伝い後）" },
    { id:"hd03", name:"わざマシン03（みずのはどう）", type:"gym", note:"ハナダジム・カスミを倒す" },
  ]},
  { area: "クチバシティ・SSアン", items: [
    { id:"ss01", name:"ひでんマシン01（いあいぎり）", type:"gift",       note:"SSアン・船長の部屋で背中をなでてあげる" },
    { id:"ss02", name:"わざマシン44（ねむる）", type:"field",           note:"SSアンB1F・アイテムボール" },
    { id:"ss03", name:"わざマシン31（ブリックブレイク）", type:"field", note:"SSアン1F客室・アイテムボール" },
    { id:"kb01", name:"わざマシン34（でんきショック）", type:"gym",     note:"クチバジム・マチスを倒す" },
    { id:"kb02", name:"バトルサーチャー", type:"gift",                       note:"クチバポケモンセンター・女性エーストレーナーから（SSアン乗船後）" },
    { id:"kb03", name:"ボロのつりざお", type:"gift",                    note:"クチバシティ・北西の釣り人の家" },
  ]},
  { area: "ルート9", items: [
    { id:"r9_01", name:"わざマシン40（つばめがえし）", type:"field", note:"9番道路南西・アイテムボール" },
  ]},
  { area: "シオンタウン・ルート12", items: [
    { id:"rv01", name:"ポケモンのふえ", type:"gift",              note:"ポケモンタワー7F・フジ老人を救出後にもらう（カビゴン起こしに必須）" },
    { id:"rv02", name:"わざマシン27（おんがえし）", type:"gift", note:"シオンタウン〜ルート12のゲート2F・女性からもらう" },
    { id:"rv03", name:"すごいつりざお", type:"gift",            note:"ルート12・釣り師の家の老釣り人からもらう" },
    { id:"rv04", name:"おおきなきのこ", type:"hidden",          note:"ポケモンタワー5F・チャネラーのそばでダウジングマシンを使用" },
    { id:"rv05", name:"やすらぎのすず", type:"hidden",            note:"ポケモンタワー7F・フジ老人がいた場所でダウジングマシン使用（救出後・シルフスコープ必要）" },
    { id:"rv06", name:"ちいさなキノコ", type:"hidden",          note:"12番道路・ダウジングマシンを使用して発見" },
    { id:"rv07", name:"すごいキズぐすり", type:"hidden",      note:"12番道路・フィッシャーマンのそばでダウジングマシンを使用" },
    { id:"rv08", name:"たべのこし", type:"hidden",              note:"12番道路・カビゴンがいた場所でダウジングマシン使用（カビゴン撃破/捕獲後）" },
  ]},
  { area: "タマムシシティ・ロケット団アジト", items: [
    { id:"tm01", name:"ひでんマシン02（そらをとぶ）", type:"gift",  note:"16番道路西・自転車専用道路の女の子（いあいぎり必要）" },
    { id:"tm02", name:"わざマシン19（ギガドレイン）", type:"gym",   note:"タマムシジム・エリカを倒す" },
    { id:"tm03", name:"わざマシン16（ひかりのかべ）", type:"gift",  note:"タマムシデパート屋上・女の子に「おいしいみず」を渡す" },
    { id:"tm04", name:"わざマシン20（しんぴのまもり）", type:"gift",        note:"タマムシデパート屋上・女の子に「サイダー」を渡す" },
    { id:"tm05", name:"わざマシン33（リフレクト）", type:"gift",    note:"タマムシデパート屋上・女の子に「レモネード」を渡す" },
    { id:"tm06", name:"シルフスコープ", type:"gift",              note:"タマムシゲームコーナー地下ロケット団アジトB4F・ジョバンニを倒す（ポケモンタワー進行に必須）" },
  ]},
  { area: "16番道路", items: [
    { id:"r16_01", name:"たべのこし", type:"hidden", note:"16番道路・カビゴンがいた場所でダウジングマシン使用（カビゴン撃破/捕獲後）" },
  ]},
  { area: "ルート15（東ゲート）", items: [
    { id:"r15_01", name:"がくしゅうそうち", type:"gift", note:"ルート15東ゲート2F・オーキドの助手（ポケモンを50種類以上捕まえた後）" },
  ]},
  { area: "ヤマブキシティ・シルフカンパニー", items: [
    { id:"yk01", name:"わざマシン29（サイコキネシス）", type:"gift", note:"ヤマブキシティ・サイキッカーのおじいさんの家" },
    { id:"yk02", name:"わざマシン04（めいそう）", type:"gym",        note:"ヤマブキジム・サブリナを倒す" },
    { id:"yk03", name:"ラプラス", type:"gift",                       note:"シルフカンパニー7F・社員からもらう" },
    { id:"yk04", name:"マスターボール", type:"gift",                 note:"シルフカンパニー11F・社長からもらう（ジョバンニ撃破後）" },
    { id:"yk05", name:"ヒットモンリー または ヒットモンチャン", type:"gift", note:"ヤマブキ格闘道場・ルイを倒した後どちらかを選択" },
  ]},
  { area: "セキチクシティ・サファリゾーン", items: [
    { id:"sc01", name:"わざマシン06（どくどく）", type:"gym",      note:"セキチクジム・キョウを倒す" },
    { id:"sc02", name:"ひでんマシン03（なみのり）", type:"field",  note:"サファリゾーン奥・秘密の家（サファリゾーン最奥まで到達）" },
    { id:"sc03", name:"きんのいれば", type:"field",                note:"サファリゾーン奥エリア・アイテムボール" },
    { id:"sc04", name:"ひでんマシン04（かいりき）", type:"gift",   note:"セキチクシティ・サファリゾーンの管理人（きんのいれば返却後）" },
    { id:"sc05", name:"いいつりざお", type:"gift",                 note:"セキチクシティ・南東の家の釣り人からもらう" },
  ]},
  { area: "グレンタウン・ポケモン屋敷", items: [
    { id:"gl01", name:"わざマシン38（だいもんじ）", type:"gym",  note:"グレンジム・カツラを倒す" },
    { id:"gl02", name:"ひみつのカギ", type:"field",            note:"ポケモン屋敷B1F・アイテムボール（グレンジム入場に必須）" },
  ]},
  { area: "はつでんしょ（パワープラント）", items: [
    { id:"pp01", name:"わざマシン17（まもる）", type:"field",   note:"はつでんしょ内・アイテムボール" },
    { id:"pp02", name:"わざマシン25（かみなり）", type:"field", note:"はつでんしょ内・アイテムボール" },
  ]},
  { area: "トキワシティ（8番目のジム）", items: [
    { id:"tw01", name:"わざマシン26（じしん）", type:"gym",    note:"トキワジム・サカキを倒す（8つ目のバッジ）" },
    { id:"tw02", name:"きょうせいギプス", type:"hidden",       note:"トキワジム内・サカキがいた場所（ダウジングマシン使用）" },
  ]},
  { area: "チャンピオンロード", items: [
    { id:"cr01", name:"わざマシン02（りゅうのつめ）", type:"field", note:"チャンピオンロード1F・アイテムボール" },
  ]},
  { area: "島1（きのこじま）・エンブスパ", items: [
    { id:"i1_01", name:"ひでんマシン06（いわくだき）", type:"gift", note:"エンブスパ（温泉）・老人からもらう" },
  ]},
  { area: "島4（たんすいじま）・こおりのぬけみち", items: [
    { id:"i4_01", name:"ひでんマシン07（たきのぼり）", type:"field", note:"こおりのぬけみち・B1Fから南の崖上へアクセスしてアイテムボールを入手" },
  ]},
  { area: "2の島・きわのみさき（クリア後）", items: [
    { id:"i2_01", name:"ふしぎなアメ", type:"hidden", note:"きわのみさき・わざおしえの家の裏のコーナーでダウジングマシンを使用" },
    { id:"i2_02", name:"PPマックス", type:"hidden",   note:"きわのみさき・たきのぼり南東の陸地でダウジングマシン使用（なみのり+たきのぼり必要）" },
  ]},
];
