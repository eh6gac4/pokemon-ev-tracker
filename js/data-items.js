import { batchFetch, saveProcessed, loadProcessed } from './pokeapi.js';

export const ITEM_DATA = [
  { area: "マサラタウン", items: [
    { id: "ma01", name: "タウンマップ",        type: "gift",   note: "自宅2F・姉デイジーからもらう",                             slug: "town-map" },
  ]},
  { area: "2番道路ゲート", items: [
    { id: "r002", tmId: "HM05",               type: "hm",     note: "2番道路東ゲート内・オーキドの助手（ポケモンを10種類以上捕まえた後）" },
  ]},
  { area: "ニビシティ・ニビのはくぶつかん", items: [
    { id: "ni01", name: "ランニングシューズ",  type: "gift",   note: "タケシ撃破後・ニビシティ右出口でオーキドの助手から",        slug: "running-shoes" },
    { id: "ni02", tmId: "TM39",               type: "gym",    note: "ニビジム・タケシを倒す" },
    { id: "ni04", name: "ひみつのコハク",      type: "gift",   note: "ニビのはくぶつかん・制限区域の科学者（いあいぎり必要）→ グレンじま研究所でプテラに復元", slug: "old-amber" },
    { id: "ni03", name: "ふしぎなアメ",        type: "hidden", note: "ニビのはくぶつかん裏・ダウジングマシンを使用して発見",       slug: "rare-candy" },
  ]},
  { area: "おつきみやま", items: [
    { id: "ot01", tmId: "TM09",               type: "field",  note: "おつきみやま1F・アイテムボール" },
    { id: "oz04", name: "ふしぎなアメ",        type: "field",  note: "おつきみやま1F・アイテムボール",                           img: "https://appmedia.jp/wp-content/uploads/2026/03/143032_4efry.webp", slug: "rare-candy" },
    { id: "ot02", name: "ほしのかけら",        type: "field",  note: "おつきみやまB2F・アイテムボール（ロケット団員エリア東の高台）", slug: "stardust" },
    { id: "oz03", tmId: "TM46",               type: "field",  note: "おつきみやまB2F・アイテムボール" },
    { id: "oz02", name: "かいのカセキ または こうらのカセキ", type: "gift", note: "おつきみやまB2F・スーパーオタクを倒した後どちらか1つ選択（かいのカセキ→オムナイト、こうらのカセキ→カブト）→ グレンじま研究所で復元" },
    { id: "oz01", name: "つきのいし",          type: "hidden", note: "おつきみやまB2F・ダウジングマシンを使用して発見",            slug: "moon-stone" },
  ]},
  { area: "ハナダシティ周辺・25番道路", items: [
    { id: "ha02", name: "ふしぎなアメ",        type: "hidden", note: "ハナダシティ・ダウジングマシンで発見",                      img: "https://appmedia.jp/wp-content/uploads/2026/03/135513_4nhoj.webp", slug: "rare-candy" },
    { id: "hd01", tmId: "TM28",               type: "gift",   note: "ハナダシティ・ロケット団員を倒した後にもらう" },
    { id: "hd02", name: "ふねのチケット",      type: "gift",   note: "25番道路・ビルの家でビルから（ポケモン変身解除の手伝い後）", slug: "ss-ticket" },
    { id: "ha01", tmId: "TM03",               type: "gym",    note: "ハナダジム・カスミを倒す" },
  ]},
  { area: "5・6番道路", items: [
    { id: "r06a", name: "ふしぎなアメ",        type: "hidden", note: "6番道路・ダウジングマシンで発見",                           img: "https://appmedia.jp/wp-content/uploads/2026/03/140021_6d8kl.webp", slug: "rare-candy" },
  ]},
  { area: "クチバシティ・サント・アンヌごう", items: [
    { id: "ss01", tmId: "HM01",               type: "hm",     note: "サント・アンヌごう・船長の部屋で背中をなでてあげる" },
    { id: "ss02", tmId: "TM44",               type: "field",  note: "サント・アンヌごうB1F・アイテムボール" },
    { id: "ss03", tmId: "TM31",               type: "field",  note: "サント・アンヌごう1F客室・アイテムボール" },
    { id: "ku01", tmId: "TM34",               type: "gym",    note: "クチバジム・マチスを倒す" },
    { id: "ku03", name: "バトルサーチャー",    type: "gift",   note: "クチバポケモンセンター・女性エーストレーナーから（サント・アンヌごう乗船後）", slug: "vs-seeker" },
    { id: "kb03", name: "ボロのつりざお",      type: "gift",   note: "クチバシティ・北西の釣り人の家",                            slug: "old-rod" },
    { id: "ku02", name: "じてんしゃ",          type: "gift",   note: "クチバシティ・ポケモンだいすきクラブの会長から「ひきかえけん」をもらう → ハナダシティの自転車屋で交換", slug: "bicycle" },
  ]},
  { area: "9〜11番道路", items: [
    { id: "r09a", name: "ふしぎなアメ",        type: "hidden", note: "9番道路・ダウジングマシンで発見",                           img: "https://appmedia.jp/wp-content/uploads/2026/03/140028_r8qxy.webp", slug: "rare-candy" },
    { id: "r9_01", tmId: "TM40",              type: "field",  note: "9番道路南西・アイテムボール" },
    { id: "r10a", name: "かわらずのいし",      type: "gift",   note: "10番道路ポケモンセンター・オーキドの助手（ポケモンを20種類以上捕まえた後）", slug: "everstone" },
    { id: "r11a", name: "ダウジングマシン",    type: "gift",   note: "11番道路ゲート2F・オーキドの助手（ポケモンを30種類以上捕まえた後）", slug: "itemfinder" },
  ]},
  { area: "12〜15番道路", items: [
    { id: "r12a", name: "ちいさなキノコ",      type: "hidden", note: "12番道路・ダウジングマシンで発見",                          slug: "tiny-mushroom" },
    { id: "rv07", name: "すごいキズぐすり",    type: "hidden", note: "12番道路・フィッシャーマンのそばでダウジングマシンを使用",  slug: "hyper-potion" },
    { id: "rv08", name: "たべのこし",          type: "hidden", note: "12番道路・カビゴンがいた場所でダウジングマシン使用（カビゴン撃破/捕獲後）", slug: "leftovers" },
    { id: "r12b", tmId: "TM48",               type: "field",  note: "12番道路・アイテムボール" },
    { id: "r12c", name: "ふしぎなアメ",        type: "hidden", note: "12番道路・ダウジングマシンで発見",                          img: "https://appmedia.jp/wp-content/uploads/2026/03/140044_jxf32.webp", slug: "rare-candy" },
    { id: "r15a", name: "がくしゅうそうち",    type: "gift",   note: "15番道路東ゲート2F・オーキドの助手（ポケモンを50種類以上捕まえた後）", slug: "exp-share" },
  ]},
  { area: "16〜17番道路（サイクリングロード）", items: [
    { id: "r16a", tmId: "HM02",               type: "hm",     note: "16番道路西・自転車専用道路の女の子（いあいぎり必要）" },
    { id: "r16b", name: "たべのこし",          type: "hidden", note: "16番道路・カビゴンがいた場所でダウジングマシン使用（カビゴン撃破/捕獲後）", slug: "leftovers" },
    { id: "r16c", name: "おまもりこばん",      type: "gift",   note: "16番道路ゲート2F・オーキドの助手（ポケモンを40種類以上捕まえた後）", slug: "amulet-coin" },
    { id: "r17a", name: "ふしぎなアメ",        type: "hidden", note: "17番道路・サイクリングロード・ダウジングマシンで発見",       img: "https://appmedia.jp/wp-content/uploads/2026/03/140035_58qiv.webp", slug: "rare-candy" },
  ]},
  { area: "タマムシシティ・ロケット団アジト", items: [
    { id: "ta01", tmId: "TM19",               type: "gym",    note: "タマムシジム・エリカを倒す" },
    { id: "tm03", tmId: "TM16",               type: "gift",   note: "タマムシデパート屋上・女の子に「おいしいみず」を渡す" },
    { id: "tm04", tmId: "TM20",               type: "gift",   note: "タマムシデパート屋上・女の子に「サイダー」を渡す" },
    { id: "tm05", tmId: "TM33",               type: "gift",   note: "タマムシデパート屋上・女の子に「レモネード」を渡す" },
    { id: "ta03", tmId: "TM12",               type: "field",  note: "ゲームコーナー地下ロケット団アジト・アイテムボール" },
    { id: "ta04", tmId: "TM23",               type: "tm",     note: "ゲームコーナー・3500コイン" },
    { id: "ta05", tmId: "TM13",               type: "tm",     note: "ゲームコーナー・4000コイン" },
    { id: "ta06", tmId: "TM24",               type: "tm",     note: "ゲームコーナー・4000コイン" },
    { id: "ta07", tmId: "TM35",               type: "tm",     note: "ゲームコーナー・4000コイン" },
    { id: "ta08", tmId: "TM30",               type: "tm",     note: "ゲームコーナー・4500コイン" },
    { id: "ta09", tmId: "TM15",               type: "field",  note: "タマムシデパート4F・7500円" },
    { id: "ta02", name: "シルフスコープ",      type: "gift",   note: "ゲームコーナー地下ロケット団アジトB4F・ジョバンニを倒す（ポケモンタワー進行に必須）", slug: "silph-scope" },
    { id: "ta10", name: "ふしぎなアメ",        type: "field",  note: "ゲームコーナー地下ロケット団アジトB3F・アイテムボール",     img: "https://appmedia.jp/wp-content/uploads/2026/03/143043_kcho1.webp", slug: "rare-candy" },
  ]},
  { area: "シオンタウン・ポケモンタワー・12番道路", items: [
    { id: "la01", name: "ポケモンのふえ",      type: "gift",   note: "ポケモンタワー7F・フジ老人を救出後にもらう（カビゴン起こしに必須）", slug: "poke-flute" },
    { id: "rv02", tmId: "TM27",               type: "gift",   note: "シオンタウン〜12番道路のゲート2F・女性からもらう" },
    { id: "rv03", name: "すごいつりざお",      type: "gift",   note: "12番道路・釣り師の家の老釣り人からもらう",                  slug: "super-rod" },
    { id: "rv04", name: "おおきなキノコ",      type: "hidden", note: "ポケモンタワー5F・チャネラーのそばでダウジングマシンを使用", slug: "big-mushroom" },
    { id: "rv05", name: "やすらぎのすず",      type: "hidden", note: "ポケモンタワー7F・フジ老人がいた場所でダウジングマシン使用（救出後・シルフスコープ必要）", slug: "soothe-bell" },
    { id: "la02", name: "ふしぎなアメ",        type: "field",  note: "ポケモンタワー6F・アイテムボール",                          img: "https://appmedia.jp/wp-content/uploads/2026/03/143057_aodly.webp", slug: "rare-candy" },
  ]},
  { area: "ヤマブキシティ・シルフカンパニー", items: [
    { id: "yk01", tmId: "TM29",               type: "gift",   note: "ヤマブキシティ・サイキッカーのおじいさんの家" },
    { id: "ya03", tmId: "TM04",               type: "gym",    note: "ヤマブキジム・ナツメを倒す" },
    { id: "ya02", name: "ラプラス",            type: "gift",   note: "シルフカンパニー7F・社員からもらう" },
    { id: "ya01", name: "マスターボール",      type: "gift",   note: "シルフカンパニー11F・社長からもらう（ジョバンニ撃破後）",   slug: "master-ball" },
    { id: "ya04", tmId: "TM01",               type: "field",  note: "ヤマブキシルフカンパニー・アイテムボール" },
    { id: "ya05", name: "ふしぎなアメ",        type: "field",  note: "シルフカンパニー10F・アイテムボール",                       img: "https://appmedia.jp/wp-content/uploads/2026/03/143114_3kf5j.webp", slug: "rare-candy" },
    { id: "yk05", name: "サワムラー または エビワラー", type: "gift", note: "ヤマブキ格闘道場・ルイを倒した後どちらかを選択" },
  ]},
  { area: "セキチクシティ・サファリゾーン", items: [
    { id: "se01", tmId: "TM06",               type: "gym",    note: "セキチクジム・キョウを倒す" },
    { id: "se02", tmId: "HM03",               type: "hm",     note: "サファリゾーン奥・秘密の家（サファリゾーン最奥まで到達）" },
    { id: "se03", name: "きんのいれば",        type: "field",  note: "サファリゾーン奥エリア・アイテムボール",                    slug: "gold-teeth" },
    { id: "se04", tmId: "HM04",               type: "hm",     note: "セキチクシティ・サファリゾーンの管理人（きんのいれば返却後）" },
    { id: "sc05", name: "いいつりざお",        type: "gift",   note: "セキチクシティ・南東の家の釣り人からもらう",                slug: "good-rod" },
    { id: "se05", name: "ふしぎなアメ",        type: "field",  note: "セキチクシティ・動物園の園長の家（かいりき必要）",           img: "https://appmedia.jp/wp-content/uploads/2026/03/143105_szgyi.webp", slug: "rare-candy" },
  ]},
  { area: "ふたごじま", items: [
    { id: "ft01", name: "げんきのかけら",      type: "field",  note: "ふたごじま B1F・アイテムボール",                            slug: "revive" },
    { id: "ft02", name: "みずのいし",          type: "field",  note: "ふたごじま B2F・アイテムボール",                            slug: "water-stone" },
    { id: "ft03", name: "おおきなしんじゅ",    type: "field",  note: "ふたごじま B2F・アイテムボール",                            slug: "big-pearl" },
    { id: "ft04", name: "みずのいし",          type: "hidden", note: "ふたごじま B2F・ダウジングマシンで発見",                    slug: "water-stone" },
    { id: "ft05", name: "ハイパーボール",      type: "field",  note: "ふたごじま B4F・アイテムボール",                            slug: "ultra-ball" },
    { id: "ft06", name: "みずのいし",          type: "hidden", note: "ふたごじま B4F・ダウジングマシンで発見",                    slug: "water-stone" },
    { id: "ft07", name: "フリーザー",          type: "field",  note: "ふたごじま B4F（1匹のみ）" },
  ]},
  { area: "グレンじま・グレンタウン・ポケモン屋敷", items: [
    { id: "gl02", name: "ひみつのカギ",        type: "field",  note: "ポケモン屋敷B1F・アイテムボール（グレンジム入場に必須）",   slug: "secret-key" },
    { id: "gr01", tmId: "TM38",               type: "gym",    note: "グレンジム・カツラを倒す" },
    { id: "gr05", name: "ふしぎなアメ",        type: "hidden", note: "ポケモン屋敷3F・ダウジングマシンで発見",                    img: "https://appmedia.jp/wp-content/uploads/2026/03/140053_dy9g3.webp", slug: "rare-candy" },
    { id: "gr02", name: "ファイヤー",          type: "field",  note: "グレンじま 洞窟奥（1匹のみ）" },
    { id: "gr03", name: "プテラ（ひみつのコハク復元）",  type: "gift", note: "グレンじま研究所（ひみつのコハク持参）" },
    { id: "gr04", name: "オムスター または カブトプス（化石復元）", type: "gift", note: "グレンじま研究所（かいのカセキ または こうらのカセキを持参）" },
  ]},
  { area: "はつでんしょ", items: [
    { id: "pp01", tmId: "TM17",               type: "field",  note: "はつでんしょ内・アイテムボール" },
    { id: "pp02", tmId: "TM25",               type: "field",  note: "はつでんしょ内・アイテムボール" },
  ]},
  { area: "トキワシティ（ジム）", items: [
    { id: "to01", tmId: "TM26",               type: "gym",    note: "トキワジム・サカキを倒す（8つ目のバッジ）" },
    { id: "to02", name: "きょうせいギプス",    type: "hidden", note: "トキワジム内・サカキがいた場所でダウジングマシン使用",       slug: "macho-brace" },
  ]},
  { area: "チャンピオンロード", items: [
    { id: "cr01", tmId: "TM02",               type: "field",  note: "チャンピオンロード1F・アイテムボール" },
    { id: "ch02", name: "ふしぎなアメ",        type: "field",  note: "チャンピオンロード1F・アイテムボール",                      img: "https://appmedia.jp/wp-content/uploads/2026/03/143122_gc2q4.webp", slug: "rare-candy" },
  ]},
  { area: "22〜23番道路・はつでんしょ（クリア後）", items: [
    { id: "r23a", name: "サンダー",            type: "field",  note: "はつでんしょ B1F（1匹のみ）" },
  ]},
  { area: "ハナダの洞窟（クリア後）", items: [
    { id: "ce02", name: "ミュウツー",          type: "field",  note: "ハナダの洞窟 最深部（1匹のみ）" },
  ]},
  { area: "島1（クリア後）", items: [
    { id: "i1_01", tmId: "HM06",              type: "hm",     note: "エンブスパ（温泉）・老人からもらう" },
  ]},
  { area: "島4（クリア後）", items: [
    { id: "i4_01", tmId: "HM07",              type: "hm",     note: "こおりのぬけみちB1F・アイテムボール" },
  ]},
  { area: "7の島（クリア後）", items: [
    { id: "sv02", name: "ふしぎなアメ",        type: "field",  note: "かえらずのあな・アイテムボール",                            img: "https://appmedia.jp/wp-content/uploads/2026/03/143130_0jao4.webp", slug: "rare-candy" },
  ]},
  { area: "2の島（クリア後）", items: [
    { id: "si01", name: "ふしぎなアメ",        type: "hidden", note: "きわのみさき・わざおしえの家の裏でダウジングマシンを使用",   img: "https://appmedia.jp/wp-content/uploads/2026/03/140110_o4sfg.webp", slug: "rare-candy" },
    { id: "i2_02", name: "ポイントマックス",   type: "hidden", note: "きわのみさき・たきのぼり南東の陸地でダウジングマシン使用（なみのり+たきのぼり必要）", slug: "pp-max" },
  ]},
];

// ─── 持ち物リスト（FR/LG Gen III） ───────────────────────────────────────────
export const HOLD_ITEMS = [
  // バトル
  { name: "こだわりハチマキ", cat: "バトル",     note: "物理攻撃×1.5（技固定）",                  slug: "choice-band" },
  { name: "たべのこし",       cat: "バトル",     note: "毎ターンHP 1/16回復",                     slug: "leftovers" },
  { name: "きあいのハチマキ", cat: "バトル",     note: "一撃耐えることがある",                     slug: "focus-band" },
  { name: "せんせいのツメ",   cat: "バトル",     note: "先制して動くことがある",                   slug: "quick-claw" },
  { name: "ひかりのこな",     cat: "バトル",     note: "相手の命中率ダウン",                       slug: "bright-powder" },
  { name: "のんきのおこう",   cat: "バトル",     note: "相手の命中率ダウン（ひかりのこなと同効果）", slug: "lax-incense" },
  { name: "おうじゃのしるし", cat: "バトル",     note: "わざにひるみ追加",                         slug: "kings-rock" },
  { name: "かいがらのすず",   cat: "バトル",     note: "与ダメの1/8回復",                         slug: "shell-bell" },
  { name: "ピントレンズ",     cat: "バトル",     note: "急所率アップ",                             slug: "scope-lens" },
  { name: "しろいハーブ",     cat: "バトル",     note: "下がったステータスを一度回復",              slug: "white-herb" },
  // タイプ強化
  { name: "もくたん",         cat: "タイプ強化", note: "ほのお×1.1",                              slug: "charcoal" },
  { name: "しんぴのしずく",   cat: "タイプ強化", note: "みず×1.1",                                slug: "mystic-water" },
  { name: "きせきのタネ",     cat: "タイプ強化", note: "くさ×1.1",                                slug: "miracle-seed" },
  { name: "じしゃく",         cat: "タイプ強化", note: "でんき×1.1",                              slug: "magnet" },
  { name: "とけないこおり",   cat: "タイプ強化", note: "こおり×1.1",                              slug: "never-melt-ice" },
  { name: "するどいくちばし", cat: "タイプ強化", note: "ひこう×1.1",                              slug: "sharp-beak" },
  { name: "かたいいし",       cat: "タイプ強化", note: "いわ×1.1",                                slug: "hard-stone" },
  { name: "くろいメガネ",     cat: "タイプ強化", note: "あく×1.1",                                slug: "black-glasses" },
  { name: "くろおび",         cat: "タイプ強化", note: "かくとう×1.1",                            slug: "black-belt" },
  { name: "どくバリ",         cat: "タイプ強化", note: "どく×1.1",                                slug: "poison-barb" },
  { name: "ぎんのこな",       cat: "タイプ強化", note: "むし×1.1",                                slug: "silver-powder" },
  { name: "まがったスプーン", cat: "タイプ強化", note: "エスパー×1.1",                            slug: "twisted-spoon" },
  { name: "りゅうのキバ",     cat: "タイプ強化", note: "ドラゴン×1.1",                            slug: "dragon-fang" },
  { name: "やわらかいすな",   cat: "タイプ強化", note: "じめん×1.1",                              slug: "soft-sand" },
  { name: "メタルコート",     cat: "タイプ強化", note: "はがね×1.1",                              slug: "metal-coat" },
  // きのみ
  { name: "きのみジュース",   cat: "きのみ",     note: "HP20回復（HP半分以下）",                  slug: "berry-juice" },
  { name: "オレンのみ",       cat: "きのみ",     note: "HP10回復（HP半分以下）",                  slug: "oran-berry" },
  { name: "オボンのみ",       cat: "きのみ",     note: "HP30回復（HP半分以下）",                  slug: "sitrus-berry" },
  { name: "カゴのみ",         cat: "きのみ",     note: "ねむりを回復",                             slug: "chesto-berry" },
  { name: "ラムのみ",         cat: "きのみ",     note: "状態異常すべてを回復",                     slug: "lum-berry" },
  // 特殊（ポケモン固有）
  { name: "ふといホネ",       cat: "特殊",       note: "カラカラ/ガラガラの攻撃×2",               slug: "thick-club" },
  { name: "でんきだま",       cat: "特殊",       note: "ピカチュウのとくこう×2",                  slug: "light-ball" },
  { name: "メタルパウダー",   cat: "特殊",       note: "メタモンの防御×2",                        slug: "metal-powder" },
  { name: "しんかいのキバ",   cat: "特殊",       note: "パールルのとくこう×2",                    slug: "deep-sea-tooth" },
  { name: "しんかいのウロコ", cat: "特殊",       note: "パールルのとくぼう×2",                    slug: "deep-sea-scale" },
  { name: "ラッキーパンチ",   cat: "特殊",       note: "ラッキーの急所率アップ",                   slug: "lucky-punch" },
  { name: "ながねぎ",         cat: "特殊",       note: "カモネギの急所率アップ",                   slug: "stick" },
  { name: "こころのしずく",   cat: "特殊",       note: "ラティアス/ラティオス とくこう・とくぼう×1.5", slug: "soul-dew" },
  // その他
  { name: "しあわせタマゴ",   cat: "その他",     note: "経験値×1.5",                              slug: "lucky-egg" },
  { name: "やすらぎのすず",   cat: "その他",     note: "なつき度が上がりやすい",                   slug: "soothe-bell" },
];

export const LOCATION_DATA = [
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
  // ─── シオンタウン → イワヤマトンネル ───
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
  { name: "イワヤマトンネル 1F", ver: "", pokemon: [
    { name: "イシツブテ", evs: { def: 1 }, rate: "35%", best: true },
    { name: "ズバット",   evs: { spe: 1 }, rate: "30%" },
    { name: "マンキー",   evs: { atk: 1 }, rate: "15%" },
    { name: "ワンリキー", evs: { atk: 1 }, rate: "15%" },
    { name: "イワーク",   evs: { def: 2 }, rate: "5%" },
  ]},
  { name: "イワヤマトンネル B1F", ver: "", pokemon: [
    { name: "イシツブテ", evs: { def: 1 }, rate: "35%", best: true },
    { name: "ズバット",   evs: { spe: 1 }, rate: "30%" },
    { name: "マンキー",   evs: { atk: 1 }, rate: "15%" },
    { name: "ワンリキー", evs: { atk: 1 }, rate: "10%" },
    { name: "イワーク",   evs: { def: 2 }, rate: "10%" },
  ]},
  // ─── シオンタウン → ポケモンタワー ───
  { name: "ポケモンタワー 3F", ver: "", pokemon: [
    { name: "ゴース",   evs: { spa: 1 }, rate: "90%", best: true },
    { name: "カラカラ", evs: { hp: 1 },  rate: "9%" },
    { name: "ゴースト", evs: { spa: 2 }, rate: "1%" },
  ]},
  { name: "ポケモンタワー 4〜5F", ver: "", pokemon: [
    { name: "ゴース",   evs: { spa: 1 }, rate: "86%", best: true },
    { name: "カラカラ", evs: { hp: 1 },  rate: "9%" },
    { name: "ゴースト", evs: { spa: 2 }, rate: "5%" },
  ]},
  { name: "ポケモンタワー 6F", ver: "", pokemon: [
    { name: "ゴース",   evs: { spa: 1 }, rate: "85%", best: true },
    { name: "カラカラ", evs: { hp: 1 },  rate: "9%" },
    { name: "ゴースト", evs: { spa: 2 }, rate: "6%" },
  ]},
  { name: "ポケモンタワー 7F", ver: "", pokemon: [
    { name: "ゴース",   evs: { spa: 1 }, rate: "75%" },
    { name: "カラカラ", evs: { hp: 1 },  rate: "10%" },
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
  // ─── サファリゾーン ───
  { name: "サファリゾーン 中央", ver: "", pokemon: [
    { name: "タマタマ",   evs: { def: 1 }, rate: "20%", best: true },
    { name: "サイホーン", evs: { def: 1 }, rate: "20%" },
    { name: "コンパン",   evs: { spd: 1 }, rate: "15%" },
    { name: "ニドラン♂", evs: { atk: 1 }, rate: "20%", ver: "FR" },
    { name: "ニドラン♀", evs: { hp: 1 },  rate: "20%", ver: "LG" },
    { name: "ニドリーノ", evs: { atk: 2 }, rate: "10%", ver: "FR" },
    { name: "ニドリーナ", evs: { hp: 2 },  rate: "10%", ver: "LG" },
    { name: "パラセクト", evs: { atk: 2 }, rate: "5%" },
    { name: "ストライク", evs: { atk: 1 }, rate: "4%",  ver: "FR" },
    { name: "カイロス",   evs: { atk: 1 }, rate: "4%",  ver: "LG" },
    { name: "ラッキー",   evs: { hp: 2 },  rate: "1%" },
  ]},
  { name: "サファリゾーン エリア1", ver: "", note: "東エリア", pokemon: [
    { name: "タマタマ",   evs: { def: 1 }, rate: "20%", best: true },
    { name: "ドードー",   evs: { atk: 1 }, rate: "20%" },
    { name: "パラス",     evs: { atk: 1 }, rate: "15%" },
    { name: "ニドラン♂", evs: { atk: 1 }, rate: "20%", ver: "FR" },
    { name: "ニドラン♀", evs: { hp: 1 },  rate: "20%", ver: "LG" },
    { name: "ニドリーノ", evs: { atk: 2 }, rate: "10%", ver: "FR" },
    { name: "ニドリーナ", evs: { hp: 2 },  rate: "10%", ver: "LG" },
    { name: "パラセクト", evs: { atk: 2 }, rate: "5%" },
    { name: "ガルーラ",   evs: { hp: 2 },  rate: "4%" },
    { name: "ストライク", evs: { atk: 1 }, rate: "1%",  ver: "FR" },
    { name: "カイロス",   evs: { atk: 1 }, rate: "1%",  ver: "LG" },
  ]},
  { name: "サファリゾーン エリア2", ver: "", note: "北エリア", pokemon: [
    { name: "タマタマ",   evs: { def: 1 }, rate: "20%", best: true },
    { name: "サイホーン", evs: { def: 1 }, rate: "20%" },
    { name: "パラス",     evs: { atk: 1 }, rate: "15%" },
    { name: "ニドラン♂", evs: { atk: 1 }, rate: "20%", ver: "FR" },
    { name: "ニドラン♀", evs: { hp: 1 },  rate: "20%", ver: "LG" },
    { name: "ニドリーノ", evs: { atk: 2 }, rate: "10%", ver: "FR" },
    { name: "ニドリーナ", evs: { hp: 2 },  rate: "10%", ver: "LG" },
    { name: "モルフォン", evs: { spa: 1 }, rate: "5%" },
    { name: "ラッキー",   evs: { hp: 2 },  rate: "4%" },
    { name: "ケンタロス", evs: { atk: 1 }, rate: "1%" },
  ]},
  { name: "サファリゾーン エリア3", ver: "", note: "西エリア", pokemon: [
    { name: "タマタマ",   evs: { def: 1 }, rate: "20%", best: true },
    { name: "ドードー",   evs: { atk: 1 }, rate: "20%" },
    { name: "コンパン",   evs: { spd: 1 }, rate: "15%" },
    { name: "ニドラン♀", evs: { hp: 1 },  rate: "20%", ver: "LG" },
    { name: "ニドラン♂", evs: { atk: 1 }, rate: "20%", ver: "FR" },
    { name: "ニドリーナ", evs: { hp: 2 },  rate: "10%", ver: "LG" },
    { name: "ニドリーノ", evs: { atk: 2 }, rate: "10%", ver: "FR" },
    { name: "モルフォン", evs: { spa: 1 }, rate: "5%" },
    { name: "ケンタロス", evs: { atk: 1 }, rate: "4%" },
    { name: "ガルーラ",   evs: { hp: 2 },  rate: "1%" },
  ]},
  { name: "サファリゾーン（スーパーロッド）", ver: "", note: "全エリア共通", pokemon: [
    { name: "ミニリュウ", evs: { atk: 1 }, rate: "15%", best: true },
    { name: "ハクリュウ", evs: { atk: 2 }, rate: "1%" },
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
    { name: "アーボック", evs: { atk: 2 }, rate: "5%", ver: "FR" },
    { name: "サンドパン", evs: { def: 2 }, rate: "5%", ver: "LG" },
    { name: "ゴルバット", evs: { spe: 2 }, rate: "5%" },
  ]},
  { name: "チャンピオンロード 2F", ver: "", pokemon: [
    { name: "イワーク",   evs: { def: 2 }, rate: "20%" },
    { name: "イシツブテ", evs: { def: 1 }, rate: "20%" },
    { name: "ワンリキー", evs: { atk: 1 }, rate: "20%" },
    { name: "オコリザル", evs: { atk: 2 }, rate: "10%" },
    { name: "ズバット",   evs: { spe: 1 }, rate: "10%" },
    { name: "ゴーリキー", evs: { atk: 2 }, rate: "5%" },
    { name: "アーボック", evs: { atk: 2 }, rate: "5%", ver: "FR" },
    { name: "サンドパン", evs: { def: 2 }, rate: "5%", ver: "LG" },
    { name: "ガラガラ",   evs: { def: 2 }, rate: "5%" },
    { name: "ゴルバット", evs: { spe: 2 }, rate: "5%" },
  ]},
  // ─── クリア後（島） ───
  { name: "廃虚の谷（なみのり）", ver: "FR", note: "1番島・島4解放後", pokemon: [
    { name: "マリル", evs: { hp: 2 }, rate: "100%", best: true },
  ]},
];

// ─────────────────────────────────────────────────────────────────
// 特殊な入手方法（野生エンカウントなし・進化なし）
// ─────────────────────────────────────────────────────────────────
export const OBTAIN_DATA = {
  "フシギダネ": "マサラタウン・スターター選択",
  "ヒトカゲ":   "マサラタウン・スターター選択",
  "ゼニガメ":   "マサラタウン・スターター選択",
  "ピカチュウ": "ビリジアンの森（FR）／ LGスターター",
  "ニョロモ":   "スーパーロッドで釣り（25番道路・ハナダこ等）",
  "ポニータ":   "サファリゾーン（FR限定）",
  "カモネギ":   "通信交換・コラッタ（クチバシティ）",
  "ベトベター": "グレンじまほら穴（LG限定）",
  "シェルダー": "グッドロッドで釣り（LG限定）",
  "クラブ":     "グッドロッドで釣り（FR限定）",
  "タマタマ":   "サファリゾーン",
  "サワムラー": "ヤマブキ格闘道場・ルイを倒した後どちらかを選択",
  "エビワラー": "ヤマブキ格闘道場・ルイを倒した後どちらかを選択",
  "ベロリンガ": "通信交換・コダック（セキチクシティ）",
  "ドガース":   "グレンじまほら穴（FR限定）",
  "サイホーン": "サファリゾーン（中央・エリア2）",
  "ラッキー":   "サファリゾーン",
  "ガルーラ":   "サファリゾーン",
  "タッツー":   "スーパーロッドで釣り（19番道路等）",
  "トサキント": "スーパーロッドで釣り（FR限定）",
  "ヒトデマン": "スーパーロッドで釣り（LG限定）",
  "バリヤード": "ライバルシティ（LG限定）",
  "ストライク": "サファリゾーン（FR限定）",
  "ルージュラ": "通信交換・ニョロゾ（ハナダシティ）",
  "ブーバー":   "ポケモンやしき（FR限定）",
  "カイロス":   "サファリゾーン（LG限定）",
  "ケンタロス": "サファリゾーン",
  "コイキング": "スーパーロッドで釣り／魚売りから購入",
  "ラプラス":   "シルフカンパニー最上階・シルフ社員から（1匹）",
  "イーブイ":   "タマムシシティ・シルフカンパニー最上階",
  "ポリゴン":   "ゲームコーナー景品（タマムシシティ）",
  "オムナイト": "かいのカセキ復元（グレンじま研究所）",
  "カブト":     "こうらのカセキ復元（グレンじま研究所）",
  "プテラ":     "ひみつのコハク復元（グレンじま研究所）",
  "カビゴン":   "12・16番道路の寝ているカビゴン（各1匹）",
  "フリーザー": "ふたごじまB1F（1匹のみ）",
  "サンダー":   "はつでんしょ（1匹のみ）",
  "ファイヤー": "グレンじまほら穴（1匹のみ）",
  "ミニリュウ": "サファリゾーン（スーパーロッド）",
  "ミュウツー": "ハナダのどうくつ（クリア後・1匹のみ）",
  "ミュウ":     "イベント配布のみ",
};

// ─── PokeAPI アイテムデータ（キャッシュ） ────────────────────────────────────
export let ITEM_API_DATA = {};

export async function loadItemsFromAPI() {
  const CACHE_KEY = 'items_v1';
  const cached = loadProcessed(CACHE_KEY);
  if (cached) { ITEM_API_DATA = cached; return; }

  const slugSet = new Set();
  ITEM_DATA.forEach(area => area.items.forEach(item => {
    const s = item.slug ?? (item.tmId ? item.tmId.toLowerCase() : null);
    if (s) slugSet.add(s);
  }));
  HOLD_ITEMS.forEach(item => { if (item.slug) slugSet.add(item.slug); });

  const slugs = [...slugSet];
  const results = await batchFetch(slugs.map(s => `/item/${s}`));

  const processed = {};
  slugs.forEach((slug, i) => {
    const r = results[i];
    if (r.status !== 'fulfilled') return;
    const d = r.value;

    const jaName = d.names?.find(n => n.language.name === 'ja')?.name
                || d.names?.find(n => n.language.name === 'ja-hrkt')?.name;

    const ftes = d.flavor_text_entries?.filter(e =>
      e.language.name === 'ja' || e.language.name === 'ja-hrkt'
    ) ?? [];
    const desc = (ftes.find(e => e.version_group?.name === 'firered-leafgreen') ?? ftes[0])
      ?.text?.replace(/\n/g, ' ');

    processed[slug] = { jaName, desc, category: d.category?.name };
  });

  saveProcessed(CACHE_KEY, processed);
  ITEM_API_DATA = processed;
}
