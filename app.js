/* ================================================================
   MOTION CATALOG — app.js
   Data, rendering, search, filtering, and interaction logic.
   No build step, no dependencies.
================================================================ */

const SEARCH_DEBOUNCE = 120

/* ── Data ───────────────────────────────────────────────────── */
const categories = [
  'Entrance','Exit','Emphasis','Feedback','Loading','Navigation',
  'List','Layout','Gesture','Reveal','Scroll','Text','Button',
  'Input','Cursor','Menu','Media','Data','Visual','Hover',
]

const targets = [
  { id: 'button', label: 'ボタン', short: 'Button' },
  { id: 'form', label: 'フォーム', short: 'Form' },
  { id: 'overlay', label: 'モーダル / メニュー', short: 'Overlay' },
  { id: 'navigation', label: 'ページ / ナビ', short: 'Navigation' },
  { id: 'notification', label: '通知 / トースト', short: 'Notification' },
  { id: 'card-list', label: 'カード / リスト', short: 'Card list' },
  { id: 'loading', label: 'ローディング', short: 'Loading' },
  { id: 'text', label: 'テキスト', short: 'Text' },
  { id: 'media', label: '画像 / メディア', short: 'Media' },
  { id: 'data', label: 'グラフ / 数値', short: 'Data' },
  { id: 'gesture', label: 'ジェスチャー / スクロール', short: 'Gesture' },
  { id: 'cursor-visual', label: 'カーソル / 視覚効果', short: 'Visual' },
]

/* Each row: [name, jpName, category, useFor, request, className, preview] */
const motions = [
  ['Fade In','フェードイン','Entrance','新しいカード、補助テキスト、空状態','この要素はフェードインで自然に表示して','fade-in','block'],
  ['Fade Up','フェードアップ','Entrance','一覧カード、モーダル、ページ冒頭','下から少しフェードアップして出して','fade-up','block'],
  ['Fade Down','フェードダウン','Entrance','ヘッダー、通知バー、検索候補','上からフェードダウンで表示して','fade-down','block'],
  ['Fade Left','フェードレフト','Entrance','右側パネル、詳細ペイン','右から左へフェードしながら入れて','fade-left','block'],
  ['Fade Right','フェードライト','Entrance','左側パネル、戻る導線','左から右へフェードしながら入れて','fade-right','block'],
  ['Scale In','スケールイン','Entrance','確認ダイアログ、重要なCTA、選択カード','小さく始まってふわっと拡大表示して','scale-in','block'],
  ['Zoom In','ズームイン','Entrance','画像、プレビュー、注目領域','ズームインしながら表示して','zoom-in','block'],
  ['Zoom Soft','ソフトズーム','Entrance','写真、商品カード、料理画像','画像はゆっくりソフトズームさせて','zoom-soft','photo'],
  ['Pop In','ポップイン','Entrance','追加完了、バッジ、リアクション','少し弾むポップインで出して','pop-in','block'],
  ['Spring In','スプリングイン','Entrance','ボタン、選択状態、楽しい反応','スプリング感のある入り方にして','spring-in','block'],
  ['Drop In','ドロップイン','Entrance','トースト、通知、メニュー','上から落ちてくるように表示して','drop-in','block'],
  ['Float In','フロートイン','Entrance','軽いカード、ヒント、チップ','ふわっと浮かぶように出して','float-in','block'],
  ['Unfold','アンフォールド','Entrance','パネル、メニュー、設定領域','折りたたみが開くように表示して','unfold','panel'],
  ['Reveal Wipe','ワイプリビール','Entrance','見出し、画像、セクション','横ワイプで中身を見せて','wipe-reveal','panel'],
  ['Mask Reveal','マスクリビール','Entrance','ブランド見出し、重要な数字','マスクが外れるように表示して','mask-reveal','text'],
  ['Clip Reveal','クリップリビール','Entrance','画像、カード、グラフ','クリップ領域が広がる感じで出して','clip-reveal','photo'],
  ['Blur In','ブラーイン','Entrance','背景、モーダル、画像','ぼかしからピントが合うように表示して','blur-in','block'],
  ['Focus In','フォーカスイン','Entrance','検索結果、画像詳細、カード','フォーカスが合うような入りにして','focus-in','photo'],
  ['Back In Down','バックイン下','Entrance','大きめの通知、印象的な導入','奥から下方向に戻ってくる感じで入れて','back-in-down','block'],
  ['Back In Left','バックイン左','Entrance','横から入るドロワー、カード','左側から少し奥行きをつけて入れて','back-in-left','block'],
  ['Back In Right','バックイン右','Entrance','詳細パネル、候補カード','右側から少し奥行きをつけて入れて','back-in-right','block'],
  ['Bounce In Down','バウンスイン下','Entrance','トースト、空状態、達成表示','上からバウンスしながら表示して','bounce-in-down','block'],
  ['Bounce In Left','バウンスイン左','Entrance','横並びカード、ナビ項目','左からバウンスしながら入れて','bounce-in-left','block'],
  ['Roll In','ロールイン','Entrance','アイコン、バッジ、楽しい追加演出','転がるようにロールインして','roll-in','circle'],
  ['Light Speed In','ライトスピードイン','Entrance','キャンペーン、速報、強い注目','勢いよく横から飛び込む感じにして','light-speed-in','block'],
  ['Jack In The Box','ジャックイン','Entrance','成功、サプライズ、空状態','箱から飛び出すような登場にして','jack-in','block'],
  ['Fade Out','フェードアウト','Exit','閉じるモーダル、消えるトースト','閉じる時はフェードアウトして','fade-out','block'],
  ['Scale Out','スケールアウト','Exit','削除、キャンセル、閉じる操作','小さく縮みながら消して','scale-out','block'],
  ['Slide Out Up','上スライドアウト','Exit','通知、完了トースト','上へ抜けるように消して','slide-out-up','block'],
  ['Slide Out Down','下スライドアウト','Exit','ボトムシート、ドロワー','下へスライドして閉じて','slide-out-down','block'],
  ['Collapse','コラプス','Exit','詳細欄、フィルター、開閉パネル','高さが畳まれて消えるようにして','collapse','panel'],
  ['Shrink Away','シュリンクアウェイ','Exit','リスト削除、タグ解除','削除時に縮んで消える動きをつけて','shrink-away','block'],
  ['Dissolve','ディゾルブ','Exit','古い状態から新しい状態への切替','細かく溶けるように切り替えて','dissolve','dots'],
  ['Swipe Away','スワイプアウェイ','Exit','通知削除、リスト項目のdismiss','横にスワイプして消える感じにして','swipe-away','block'],
  ['Back Out Up','バックアウト上','Exit','通知、警告、トースト','奥へ引きながら上方向に抜けて消して','back-out-up','block'],
  ['Bounce Out Right','バウンスアウト右','Exit','却下、スワイプ削除、dismiss','右へバウンスしながら消して','bounce-out-right','block'],
  ['Roll Out','ロールアウト','Exit','削除、閉じる、退場演出','転がりながら消して','roll-out','circle'],
  ['Light Speed Out','ライトスピードアウト','Exit','一時通知、速報の退場','横へ勢いよく抜けて消して','light-speed-out','block'],
  ['Hinge','ヒンジ','Exit','削除、失敗、コミカルな退場','ヒンジで外れて落ちるようにして','hinge','block'],
  ['Pulse','パルス','Emphasis','録音中、同期中、注意バッジ','待機中は控えめにパルスさせて','pulse','block'],
  ['Heartbeat','ハートビート','Emphasis','お気に入り、保存、健康系の状態','保存時にハートビートっぽく反応させて','heartbeat','circle'],
  ['Bounce','バウンス','Emphasis','成功、楽しいCTA、空状態の誘導','完了時に小さくバウンスさせて','bounce','block'],
  ['Bob','ボブ','Emphasis','浮遊ボタン、ヘルプ、軽い注目','ゆっくり上下に浮かせて','bob','circle'],
  ['Wiggle','ウィグル','Emphasis','編集可能、ドラッグ可能、注意喚起','編集できることが伝わるように少しウィグルして','wiggle','block'],
  ['Jiggle','ジグル','Emphasis','並べ替え、削除モード、モバイル編集','編集モードでは小刻みにジグルさせて','jiggle','block'],
  ['Glow','グロー','Emphasis','重要CTA、新着、選択中','選択中は控えめにグローさせて','glow','block'],
  ['Highlight Sweep','ハイライトスイープ','Emphasis','新機能、更新された行、注目テキスト','新しく変わった部分にハイライトスイープを入れて','highlight-sweep','panel'],
  ['Ping','ピング','Emphasis','通知点、ライブ状態、位置マーカー','通知点はピングで知らせて','ping','dot'],
  ['Breathing','ブリージング','Emphasis','常時状態、音声待機、穏やかな注目','呼吸するような弱い伸縮にして','breathing','circle'],
  ['Rubber Band','ラバーバンド','Emphasis','コミカルな成功、選択反応','少しゴムっぽく伸縮させて','rubber-band','block'],
  ['Tada','タダ','Emphasis','達成、保存完了、節目','達成時にtada系の祝う動きにして','tada','block'],
  ['Wobble','ウォブル','Emphasis','注意喚起、楽しいCTA','左右にウォブルさせて注目させて','wobble','block'],
  ['Jello','ジェロー','Emphasis','選択、リアクション、playful UI','ゼリーっぽくぷるっと反応させて','jello','block'],
  ['Shake','シェイク','Feedback','入力エラー、失敗、禁止操作','エラー時に横へ軽くシェイクして','shake','block'],
  ['Nudge','ナッジ','Feedback','未選択、入力促進、次の導線','次に押す場所をナッジで示して','nudge','block'],
  ['Flash','フラッシュ','Feedback','新着、更新、警告','更新された瞬間だけフラッシュさせて','flash','block'],
  ['Blink','ブリンク','Feedback','カーソル、接続待ち、点滅通知','状態点をブリンクさせて','blink','dot'],
  ['Success Check','チェック描画','Feedback','保存完了、送信完了、検証成功','成功時にチェックが描かれる動きにして','success-check','check'],
  ['Error X','エックス描画','Feedback','失敗、削除不可、検証エラー','エラー時にXが描かれる動きにして','error-x','xmark'],
  ['Button Press','プレス','Feedback','クリック、タップ、決定操作','押した瞬間に沈むプレス感をつけて','button-press','button'],
  ['Ripple','リップル','Feedback','タップ領域、モバイルボタン、選択','タップ時にリップルを広げて','ripple','button'],
  ['Magnetic Hover','マグネティック','Feedback','主CTA、カード、操作対象','ホバー時に吸い寄せられる感じにして','magnetic','button'],
  ['Tilt Hover','チルト','Feedback','カード、画像、商品タイル','ホバー時に少し傾くチルトを入れて','tilt','photo'],
  ['Lift Hover','リフト','Feedback','カード、ボタン、リスト項目','ホバー時に少し持ち上がるようにして','lift','block'],
  ['Head Shake','ヘッドシェイク','Feedback','ログイン失敗、否定、入力エラー','だめ、という感じのヘッドシェイクにして','head-shake','block'],
  ['Spinner','スピナー','Loading','短いロード、ボタン内処理','ボタン内はスピナーで処理中を示して','spinner','spinner'],
  ['Dots','ドットローダー','Loading','会話、生成中、軽い待機','生成中は3点ドットで待機を見せて','dots-loader','dots'],
  ['Bars','バーグラフローダー','Loading','音声入力、分析中、処理中','処理中はバーが上下するローダーにして','bars-loader','bars'],
  ['Skeleton Shimmer','スケルトンシマー','Loading','カード、画像、一覧ロード','読み込み中はスケルトンシマーにして','skeleton-shimmer','skeleton'],
  ['Progress Fill','プログレスフィル','Loading','アップロード、生成、ステップ処理','進捗バーが左から伸びるようにして','progress-fill','progress'],
  ['Circular Progress','円形プログレス','Loading','同期、保存、生成中','円形プログレスで待機を見せて','circular-progress','ring'],
  ['Indeterminate Bar','不定バー','Loading','進捗不明の待機','進捗不明は横に流れるバーにして','indeterminate','progress'],
  ['Wave Loader','ウェーブローダー','Loading','音声、AI生成、通信中','波のようなローディングにして','wave-loader','wave'],
  ['Orbit','オービット','Loading','検索中、同期中、AI処理','小さい点が回るオービットにして','orbit','orbit'],
  ['Morph Loader','モーフローダー','Loading','生成、変換、AI処理','形が変化するローダーにして','morph-loader','morph-loader'],
  ['Tab Indicator','タブインジケーター','Navigation','タブ切替、セグメント選択','タブ下線が滑るように移動して','tab-indicator','tabs'],
  ['Underline Grow','下線グロー','Navigation','ナビ、リンク、カテゴリ','ホバーで下線が伸びるようにして','underline-grow','link'],
  ['Accordion','アコーディオン','Navigation','FAQ、詳細、フィルター','詳細はアコーディオンで開閉して','accordion','accordion'],
  ['Drawer Slide','ドロワースライド','Navigation','サイドメニュー、設定、フィルター','ドロワーは横からスライドインして','drawer-slide','drawer'],
  ['Bottom Sheet','ボトムシート','Navigation','モバイル操作、詳細、選択','モバイルはボトムシートで上がってくるようにして','bottom-sheet','sheet'],
  ['Modal Backdrop','バックドロップ','Navigation','モーダル、確認、詳細表示','背景を少し暗くしてモーダルを浮かせて','modal-backdrop','modal'],
  ['Crossfade','クロスフェード','Navigation','タブ内容、画像、状態変更','タブの中身はクロスフェードで切り替えて','crossfade','crossfade'],
  ['Shared Axis X','共有軸X','Navigation','横方向のページ遷移、次へ/戻る','ページ遷移は横方向の共有軸で動かして','shared-axis-x','block'],
  ['Shared Axis Y','共有軸Y','Navigation','上下階層、詳細への移動','詳細遷移は縦方向の共有軸で動かして','shared-axis-y','block'],
  ['Shared Axis Z','共有軸Z','Navigation','一覧から詳細、拡大遷移','一覧から詳細は奥行き方向の共有軸にして','shared-axis-z','block'],
  ['Page Slide','ページスライド','Navigation','画面遷移、オンボーディング','次画面へスライド遷移して','page-slide','page'],
  ['Breadcrumb Shift','パンくずシフト','Navigation','階層移動、戻る導線','階層が変わる時にパンくずを滑らせて','breadcrumb-shift','breadcrumb'],
  ['Stagger Up','スタッガーアップ','List','カード一覧、検索結果、メニュー','一覧は下から順番にスタッガー表示して','stagger-up','stagger'],
  ['Stagger Fade','スタッガーフェード','List','テーブル、通知、チップ','要素を順番にフェード表示して','stagger-fade','stagger'],
  ['Cascade','カスケード','List','グリッド、ギャラリー、候補一覧','グリッドをカスケードで表示して','cascade','grid'],
  ['List Insert','リスト挿入','List','新規行、タグ追加、注文追加','新規項目は押し広げながら挿入して','list-insert','list'],
  ['List Remove','リスト削除','List','行削除、通知削除、タグ解除','削除時は行が縮んで詰まるようにして','list-remove','list'],
  ['Reorder Shift','並べ替えシフト','List','ドラッグ並べ替え、優先順位変更','並べ替え時に周囲が滑らかに避けるようにして','reorder-shift','list'],
  ['Filter Shuffle','フィルターシャッフル','List','検索、絞り込み、カテゴリ変更','絞り込み時にカードがシャッフルして整列する感じにして','filter-shuffle','grid'],
  ['Count Up','カウントアップ','List','数値、合計、指標、価格','数字はカウントアップで更新して','count-up','number'],
  ['Flip','フリップ','Layout','カード表裏、状態切替、詳細表示','カードをフリップして裏面に切り替えて','flip','block'],
  ['Flip X','横フリップ','Layout','画像カード、比較カード','横軸でくるっとフリップして','flip-x','block'],
  ['Flip Y','縦フリップ','Layout','カレンダー、日付、カード','縦軸でフリップして切り替えて','flip-y','block'],
  ['Rotate','ローテート','Layout','更新、再生成、同期、アイコン','更新アイコンはローテートで動かして','rotate','block'],
  ['Swing','スイング','Layout','メニュー、吊り下げUI、注意表示','軽くスイングする動きを入れて','swing','block'],
  ['Skew','スキュー','Layout','勢いのある遷移、バナー','少し斜めに歪みながら入れて','skew','block'],
  ['Morph Shape','シェイプモーフ','Layout','ボタンからパネル、状態変化','形が滑らかに変わるモーフにして','morph-shape','block'],
  ['Expand Card','カード拡張','Layout','一覧から詳細、プレビュー拡大','カードがその場で拡張するようにして','expand-card','card'],
  ['Squash Stretch','スクワッシュ','Layout','楽しいボタン、ドラッグ反応','押した時に少し潰れて伸びる感じにして','squash-stretch','block'],
  ['Perspective Tilt','奥行きチルト','Layout','3Dカード、画像プレビュー','奥行きのあるチルトをつけて','perspective-tilt','photo'],
  ['Drag Ghost','ドラッグゴースト','Gesture','ドラッグ中、並べ替え、選択移動','ドラッグ中はゴーストを少し浮かせて','drag-ghost','card'],
  ['Swipe Hint','スワイプヒント','Gesture','カルーセル、横スクロール、削除操作','横に少し揺らしてスワイプ可能に見せて','swipe-hint','phone'],
  ['Pull To Refresh','プルトゥリフレッシュ','Gesture','モバイル更新、一覧再読込','下に引いた時に更新の手応えを出して','pull-refresh','phone'],
  ['Long Press','ロングプレス','Gesture','コンテキストメニュー、編集モード','長押しでじわっと反応するようにして','long-press','button'],
  ['Pinch Zoom','ピンチズーム','Gesture','画像、地図、プレビュー','ピンチ操作でズームする感じを見せて','pinch-zoom','photo'],
  ['Drag Snap','スナップ','Gesture','スライダー、カード、ボトムシート','ドラッグ後に吸着するスナップ感をつけて','drag-snap','slider'],
  ['Swipe Deck','スワイプデッキ','Gesture','カード評価、候補選択','カードをスワイプデッキ風に動かして','swipe-deck','card'],
  ['Tap Burst','タップバースト','Gesture','リアクション、いいね、成功','タップ時に小さなバーストを出して','tap-burst','burst'],
  ['Image Reveal','画像リビール','Reveal','料理画像、商品画像、ギャラリー','画像は左からリビールして見せて','image-reveal','photo'],
  ['Text Reveal','テキストリビール','Reveal','見出し、キャッチコピー、重要ラベル','テキストを一行ずつリビールして','text-reveal','text'],
  ['Line Draw','ライン描画','Reveal','グラフ、経路、区切り線','線が描かれるアニメーションにして','line-draw','line'],
  ['Border Draw','ボーダー描画','Reveal','選択カード、入力フォーカス','枠線が描かれるようにして','border-draw','border'],
  ['Radial Reveal','ラジアルリビール','Reveal','地図、画像、スポットライト','円形に広がって表示して','radial-reveal','circle'],
  ['Spotlight','スポットライト','Reveal','注目箇所、チュートリアル、ガイド','注目箇所にスポットライトを当てて','spotlight','spotlight'],
  ['Curtain','カーテン','Reveal','ページ導入、セクション切替','カーテンが開くように表示して','curtain','panel'],
  ['Typewriter','タイプライター','Text','AI返答、検索中、見出し','テキストをタイプライター風に表示して','typewriter','type'],
  ['Letter Spacing','字間展開','Text','ブランド名、見出し、完了表示','文字が少し広がりながら出るようにして','letter-spacing','text'],
  ['Word Stagger','単語スタッガー','Text','説明文、ヒーローコピー','単語ごとに順番に出して','word-stagger','words'],
  ['Number Ticker','数字ティッカー','Text','価格、合計、カウント','数字は縦に回るティッカー風にして','number-ticker','ticker'],
  ['Scramble','スクランブル','Text','AI生成、検索、ハッカー風演出','生成中は文字がスクランブルして揃う感じにして','scramble','scramble'],
  ['Gradient Text Sweep','文字グラデスイープ','Text','新機能、強調見出し','文字に光が走るようにして','text-sweep','text'],
  ['Parallax','パララックス','Scroll','ヒーロー、背景、奥行き表現','背景だけ少し遅れて動くパララックス感を出して','parallax','scene'],
  ['Scroll Fade','スクロールフェード','Scroll','セクション、カード、説明文','スクロールで近づいたらフェードインして','scroll-fade','block'],
  ['Scroll Scale','スクロールスケール','Scroll','画像、グラフ、重要カード','スクロールに合わせて少し拡大して','scroll-scale','photo'],
  ['Sticky Reveal','スティッキーリビール','Scroll','比較、手順、ストーリー','固定されたまま内容が順に切り替わる感じにして','sticky-reveal','panel'],
  ['Depth Fade','奥行きフェード','Scroll','背景、カード群、階層表現','奥から近づくようにフェードして','depth-fade','block'],
  ['Scroll Progress','スクロール進捗','Scroll','記事、長いフォーム、手順','上部にスクロール進捗バーを入れて','scroll-progress','progress'],
  ['Ken Burns','ケンバーンズ','Scroll','写真、料理画像、店舗画像','写真にゆっくりパンとズームを入れて','ken-burns','photo'],
  ['Depth Cards','奥行きカード','Scroll','複数カード、比較、ストーリー','カードが奥行きを持って重なるようにして','depth-cards','deck'],
  ['Copy Confirm','コピー確認','Button','コピー、共有、招待リンク','コピー後にボタンがチェックへ変わる動きにして','copy-confirm','button'],
  ['Scale Tap','スケールタップ','Button','主要CTA、通常ボタン、モバイルタップ','クリックした瞬間に少し縮んで戻るスケールタップにして','scale-tap','button'],
  ['Depth Press','奥行きプレス','Button','立体的なCTA、決定ボタン、決済ボタン','押した時に影が浅くなって奥へ沈むようにして','depth-press','button'],
  ['Soft Rebound','ソフトリバウンド','Button','軽いCTA、保存、次へボタン','クリック後に柔らかく戻るリバウンドをつけて','soft-rebound','button'],
  ['Haptic Pop','ハプティックポップ','Button','モバイルCTA、リアクション、選択完了','タップした瞬間に短く弾けるハプティック風のポップを入れて','haptic-pop','button'],
  ['Icon Swap','アイコン入れ替え','Button','送信、保存、共有、状態切替','クリック後にアイコンが差し替わるように見せて','icon-swap','button-icon'],
  ['Label Slide','ラベルスライド','Button','購入、登録、次へ、実行ボタン','クリック時にラベルが横へ滑って次の状態へ切り替わるようにして','label-slide','button-label'],
  ['Inline Loading','インラインローディング','Button','送信中、保存中、AI生成開始','クリック後にボタン内へローダーを表示して処理中を見せて','inline-loading','button-loader'],
  ['Success Fill','成功フィル','Button','保存完了、送信完了、購入完了','クリック後に背景が左から満ちて成功状態へ変わるようにして','success-fill','button-fill'],
  ['Destructive Step','破壊的ステップ','Button','削除、キャンセル、リセット、退会','削除ボタンは一度警告色へ変わってから確定できる動きにして','destructive-step','button-danger'],
  ['Hold To Confirm','長押し確認','Button','削除、送信、危険操作','長押しで進捗が満ちたら確定する動きにして','hold-confirm','button'],
  ['Submit Morph','送信モーフ','Button','フォーム送信、保存、生成開始','送信ボタンをローダーへモーフさせて','submit-morph','button-submit'],
  ['Favorite Burst','お気に入りバースト','Button','いいね、お気に入り、保存','お気に入り時に小さなバーストを出して','favorite-burst','burst'],
  ['Download Drop','ダウンロードドロップ','Button','ダウンロード、エクスポート','矢印が下に落ちるダウンロード感を出して','download-drop','button-download'],
  ['Action Choice Expand','選択肢展開ボタン','Button','作成メニュー、共有先選択、保存先選択、複数アクション','ボタンを押したら選択肢が下に広がって表示されるようにして','choice-expand','choice-expand'],
  ['Split Button Expand','分割ボタン展開','Button','保存方法選択、エクスポート形式、追加操作','右側の小さな矢印ボタンから補助アクションを展開して','split-button-expand','button-split'],
  ['Segmented Choice','セグメント選択','Button','表示切替、期間切替、モード選択','クリックしたセグメントへインジケーターが滑るようにして','segmented-choice','button-segmented'],
  ['Count Bump','カウントバンプ','Button','いいね数、カート数量、投票、リアクション','クリック後に数字が少し跳ねて増えるようにして','count-bump','button-count'],
  ['Delete Burn','削除バーン','Button','削除、破棄、リセット','削除時に熱で消えるような退場にして','delete-burn','block'],
  ['Disabled Deny','無効デナイ','Button','押せないボタン、権限なし','無効ボタンを押した時に小さく拒否反応を出して','disabled-deny','button'],
  ['Focus Ring','フォーカスリング','Input','入力欄、検索、フォーム','フォーカス時にリングが広がるようにして','focus-ring','input'],
  ['Floating Label','フローティングラベル','Input','フォーム、検索、ログイン','入力開始でラベルが上に浮くようにして','floating-label','input'],
  ['Validation Success','入力成功','Input','フォーム検証、メール、パスワード','入力が正しい時にチェックが描かれるようにして','validation-success','input-success'],
  ['Validation Error','入力エラー','Input','必須項目、形式エラー','入力エラー時に枠をシェイクして赤くして','validation-error','input-error'],
  ['Password Reveal','パスワード表示','Input','パスワード欄、秘密情報','表示切替でアイコンと内容をクロスフェードして','password-reveal','input'],
  ['Autocomplete Drop','候補ドロップ','Input','検索候補、住所入力、タグ入力','候補リストを下にドロップして表示して','autocomplete-drop','autocomplete'],
  ['Character Counter','文字数カウンター','Input','投稿欄、メモ、制限付き入力','残り文字数を小さくカウント変化させて','character-counter','char-counter'],
  ['Switch Toggle','スイッチトグル','Input','設定、ON/OFF、通知','スイッチのつまみを滑らかに切り替えて','switch-toggle','switch'],
  ['Checkbox Tick','チェックボックス','Input','選択、タスク完了、規約同意','チェックが描かれるチェックボックスにして','checkbox-tick','checkbox'],
  ['Radio Pop','ラジオポップ','Input','単一選択、プラン選択','ラジオ選択時に中央点をポップさせて','radio-pop','radio'],
  ['Cursor Follow','カーソル追従','Cursor','ホバー領域、ギャラリー、特集ページ','カーソルを遅れて追従する感じにして','cursor-follow','cursor'],
  ['Cursor Trail','カーソルトレイル','Cursor','遊びのあるLP、ギャラリー','カーソルの残像トレイルを出して','cursor-trail','trail'],
  ['Cursor Spotlight','カーソルスポットライト','Cursor','ダークUI、探索、注目領域','カーソル周辺だけ明るくなるスポットライトにして','cursor-spotlight','spotlight'],
  ['Magnetic Target','マグネットターゲット','Cursor','主CTA、リンク、カード','ホバー時にターゲットへ吸い寄せる動きにして','magnetic-target','button'],
  ['Adaptive Caret','可変キャレット','Cursor','エディタ、検索、テキスト入力','キャレットが文字サイズに合わせて伸縮する感じにして','adaptive-caret','type'],
  ['Context Menu','コンテキストメニュー','Menu','右クリック、追加操作、詳細メニュー','コンテキストメニューを小さく開く動きにして','context-menu','menu'],
  ['Command Palette','コマンドパレット','Menu','検索、ショートカット、管理画面','コマンドパレットを中央からスケール表示して','command-palette','menu'],
  ['Radial Menu','ラジアルメニュー','Menu','FAB、ツール選択、編集操作','選択肢が円形に広がるラジアルメニューにして','radial-menu','radial'],
  ['Mega Menu','メガメニュー','Menu','ナビ、カテゴリ、EC','メガメニューを柔らかく展開して','mega-menu','menu'],
  ['Floating Action Fan','FABファン','Menu','モバイル追加、作成メニュー','FABから項目が扇状に広がるようにして','fab-fan','radial'],
  ['Tooltip Float','ツールチップ浮上','Menu','補足説明、ヘルプ、アイコンボタン','ツールチップを少し浮かせて表示して','tooltip-float','tooltip'],
  ['Notification Stack','通知スタック','Menu','通知一覧、トースト、iOS風UI','通知カードを重なったスタックで展開して','notification-stack','deck'],
  ['Coverflow Carousel','カバーフロー','Media','画像ギャラリー、商品、レシピ','カルーセルをカバーフロー風にして','coverflow','deck'],
  ['Thumbnail Gallery','サムネギャラリー','Media','画像選択、動画、レシピ手順','サムネイル選択でメイン画像が滑らかに切り替わるようにして','thumbnail-gallery','gallery'],
  ['Image Compare Slider','画像比較スライダー','Media','before/after、加工前後、比較','画像比較スライダーで左右にリビールして','image-compare','compare'],
  ['Video Scrub','動画スクラブ','Media','動画プレビュー、タイムライン','スクラブでフレームが追従する感じを見せて','video-scrub','progress'],
  ['3D Carousel','3Dカルーセル','Media','特集、商品、ギャラリー','奥行きのある3Dカルーセルにして','carousel-3d','deck'],
  ['Marquee','マーキー','Media','ロゴ列、タグ、ニュース','横に流れるマーキーにして','marquee','marquee'],
  ['Line Chart Draw','線グラフ描画','Data','分析、売上、トレンド','線グラフが描かれるように表示して','line-chart-draw','chart-line'],
  ['Bar Chart Grow','棒グラフ成長','Data','集計、比較、ランキング','棒グラフを下から伸ばして表示して','bar-chart-grow','chart-bars'],
  ['Pie Chart Sweep','円グラフスイープ','Data','構成比、進捗、分析','円グラフをスイープで描画して','pie-chart-sweep','pie'],
  ['Sparkline Trace','スパークライン','Data','小さな指標、カード内推移','スパークラインをなぞるように表示して','sparkline-trace','chart-line'],
  ['Heatmap Pulse','ヒートマップパルス','Data','活動量、カレンダー、混雑度','ヒートマップのセルを順にパルスさせて','heatmap-pulse','heatmap'],
  ['Sort Rows','行ソート','Data','テーブル、ランキング、優先順位','ソート時に行が滑らかに入れ替わるようにして','sort-rows','list'],
  ['Map Pin Drop','ピンドロップ','Data','地図、店舗、場所選択','地図ピンが落ちて跳ねるようにして','map-pin-drop','pin'],
  ['Gauge Sweep','ゲージスイープ','Data','スコア、達成率、リスク表示','ゲージ針がスイープするようにして','gauge-sweep','gauge'],
  ['Glass Blur','グラスブラー','Visual','モーダル、ナビ、オーバーレイ','背景をグラスブラーで柔らかく見せて','glass-blur','panel'],
  ['Liquid Blob','リキッドブロブ','Visual','AI生成、ブランド演出、ローダー','液体のように形が変わるブロブにして','liquid-blob','liquid-blob'],
  ['Gradient Drift','グラデーションドリフト','Visual','背景、ヒーロー、カード','グラデーションがゆっくり流れるようにして','gradient-drift','panel'],
  ['Noise Flicker','ノイズフリッカー','Visual','実験的UI、スキャン、エラー','薄いノイズがちらつく感じにして','noise-flicker','panel'],
  ['Scanline','スキャンライン','Visual','検索中、読み取り、AI解析','スキャンラインが上から下へ走るようにして','scanline','panel'],
  ['Glitch','グリッチ','Visual','エラー、サイバー風、生成演出','文字やカードを一瞬グリッチさせて','glitch','text'],
  ['Warp Overlay','ワープオーバーレイ','Visual','ページ遷移、AI演出、実験UI','オーバーレイが歪むワープ遷移にして','warp-overlay','panel'],
  ['Conic Pointer','コニックポインター','Visual','選択リング、ホバー、ハイライト','円錐グラデーションのポインターを回して','conic-pointer','ring'],
  ['Aurora Flow','オーロラフロー','Visual','背景、ヒーロー、AI生成','背景にオーロラのような流れを入れて','aurora-flow','panel'],
  ['Stepper Advance','ステッパー前進','Navigation','手順フォーム、チェックアウト、登録フロー','ステップが完了して次へ進む動きにして','stepper-advance','stepper'],
  ['Progress Steps','進捗ステップ','Loading','ウィザード、複数段階の処理、セットアップ','ステップが順に完了していく進捗表示にして','progress-steps','stepper'],
  ['Star Rating Fill','星評価フィル','Feedback','レビュー、評価入力、満足度','星が順番に埋まる評価アニメにして','star-rating','stars'],
  ['Like Heart Burst','ハートバースト','Feedback','いいね、お気に入り、リアクション','ハートが弾けて満たされるいいねにして','heart-burst','heart'],
  ['Chip Add','チップ追加','List','タグ入力、フィルター選択、宛先追加','タグチップがポップして追加されるようにして','chip-add','chips'],
  ['Chip Remove','チップ削除','List','タグ解除、フィルター解除、選択解除','チップが縮んで外れて詰まるようにして','chip-remove','chips'],
  ['Avatar Stack','アバタースタック','List','参加者一覧、共同編集、メンバー表示','アバターが順に重なって並ぶようにして','avatar-stack','avatars'],
  ['OTP Focus Hop','OTP入力ホップ','Input','認証コード、PIN入力、確認コード','入力のたびに次の枠へフォーカスが移る動きにして','otp-hop','otp'],
  ['Search Expand','検索展開','Input','ヘッダー検索、ツールバー、アイコン起点の入力','アイコンから検索欄が横に展開するようにして','search-expand','search-expand'],
  ['Slider Value Pop','スライダー値ポップ','Input','音量、価格範囲、明るさ調整','ドラッグ中に現在値がポップして見えるようにして','slider-pop','slider'],
  ['Typing Indicator','入力中インジケーター','Loading','チャット、AI応答待ち、会話UI','相手が入力中とわかるドットアニメにして','typing-indicator','dots'],
  ['Skeleton Pulse','スケルトンパルス','Loading','一覧ロード、プロフィール読み込み','スケルトンを明滅させて読み込みを見せて','skeleton-pulse','skeleton'],
  ['Upload Progress','アップロード完了','Loading','ファイル添付、画像アップロード','ファイルが上がって完了チェックへ変わる動きにして','upload-progress','upload'],
  ['Confetti Burst','紙吹雪バースト','Feedback','達成、購入完了、レベルアップ','完了時に紙吹雪を散らして祝って','confetti','confetti'],
  ['Badge Counter Pop','バッジカウンター','Emphasis','未読数、カート数、通知バッジ','未読バッジが弾んで数字が更新されるようにして','badge-pop','badge'],
  ['Bell Ring','ベルリング','Emphasis','新着通知、リマインダー、アラート','通知ベルが揺れて知らせるようにして','bell-ring','bell'],
  ['Empty State Float','空状態フロート','Emphasis','データなし、初回画面、検索0件','空状態のイラストをゆっくり浮かせて','empty-float','empty'],
  ['Theme Toggle','テーマ切替','Button','ダークモード切替、表示設定','太陽と月が入れ替わるテーマ切替にして','theme-toggle','theme-toggle'],
  ['Pagination Dots','ページネーションドット','Navigation','カルーセル、オンボーディング、スライド','アクティブなドットが伸びて移動するようにして','pagination-dots','pagedots'],
  ['Toast Queue','トーストキュー','Menu','連続通知、複数アラート、保存の連発','トーストが積み上がって順に消えるようにして','toast-queue','toast-queue'],
  ['Price Flip','価格フリップ','Data','料金表示、為替、更新される数値','価格が上下にフリップして更新されるようにして','price-flip','ticker'],
  ['Number Odometer','オドメーター','Data','フォロワー数、売上、統計値','数字がオドメーター式に回転して揃うようにして','odometer','ticker'],
  ['Signal Bars','シグナルバー','Data','接続強度、音量レベル、稼働状況','シグナルバーが順に立ち上がるようにして','signal-bars','bars'],
  ['Card Shuffle','カードシャッフル','Layout','デッキ、ランダム表示、抽選','カードが切り直されるシャッフルにして','card-shuffle','deck'],
  ['Breathing Backdrop','呼吸背景','Visual','瞑想アプリ、待機画面、オンボーディング','背景がゆっくり呼吸するように明滅させて','breath-backdrop','panel'],

  /* ── v2.1 additions ── */
  ['Dual Ring Spinner','デュアルリング','Loading','同期、送信、汎用ローディング','二重リングが逆回転するスピナーにして','dual-ring','custom',
    '<div class="preview-motion dual-ring pv-dual-ring"><span></span><i></i></div>'],
  ['Comet Spinner','コメットスピナー','Loading','AI生成、検索、軽い待機','尾を引くコメット型スピナーにして','comet-spin','custom',
    '<div class="preview-motion comet-spin pv-comet"></div>'],
  ['Dots Circle','ドットサークル','Loading','アプリ起動、同期、待機','円周上のドットが順に光るローダーにして','dots-circle','custom',
    `<div class="preview-motion dots-circle pv-dots-circle">${Array.from({length:8},()=>'<span></span>').join('')}</div>`],
  ['Hourglass Flip','砂時計フリップ','Loading','長い処理、レポート生成','砂時計が反転するローディングにして','hourglass-flip','custom',
    '<div class="preview-motion hourglass-flip pv-hourglass"></div>'],
  ['Bar Staircase','バー階段','Loading','分析中、集計中','バーが階段状に上がるローダーにして','bar-staircase','custom',
    '<div class="preview-motion bar-staircase pv-staircase"><span></span><span></span><span></span><span></span></div>'],
  ['Dots Conveyor','ドットコンベア','Loading','転送中、アップロード、同期','ドットが流れるコンベア式ローダーにして','dots-conveyor','custom',
    '<div class="preview-motion dots-conveyor pv-conveyor"><span></span><span></span><span></span><span></span></div>'],
  ['Striped Progress','ストライプ進捗','Loading','ビルド、コピー、長時間処理','進捗バーに流れる斜めストライプを入れて','progress-striped','custom',
    '<div class="preview-motion progress-striped pv-striped"><span></span></div>'],
  ['Battery Charge','バッテリー充電','Loading','充電中、蓄積、達成度','バッテリーのセグメントが順に満ちるようにして','battery-charge','custom',
    '<div class="preview-motion battery-charge pv-battery"><span></span><span></span><span></span><i></i></div>'],
  ['Radar Sweep','レーダースイープ','Loading','検索中、スキャン、探索','レーダーが掃引して点が見つかる動きにして','radar-sweep','custom',
    '<div class="preview-motion radar-sweep pv-radar"><span></span><i></i></div>'],
  ['Donut Chart Draw','ドーナツ描画','Data','構成比、進捗、ダッシュボード','ドーナツチャートが描かれるようにして','donut-draw','custom',
    '<div class="preview-motion donut-draw pv-donut"><svg viewBox="0 0 52 52" aria-hidden="true"><circle class="pv-donut-track" cx="26" cy="26" r="20"/><circle class="pv-donut-arc" cx="26" cy="26" r="20"/></svg><b>64%</b></div>'],
  ['Area Chart Fill','エリアチャート','Data','推移、累計、トレンド','エリアチャートが下から満ちるようにして','area-fill','custom',
    '<div class="preview-motion area-fill pv-area"><span></span></div>'],
  ['KPI Delta Pop','KPIデルタ','Data','前週比、増減表示、ダッシュボード','増減の矢印と差分がポップして出るようにして','kpi-delta','custom',
    '<div class="preview-motion kpi-delta pv-kpi"><span>1,284</span><i>▲ 12%</i></div>'],
  ['Row Highlight Update','行更新ハイライト','Data','リアルタイム更新、株価、順位','更新された行だけハイライトが走るようにして','row-update','custom',
    '<div class="preview-motion row-update pv-rows"><span></span><span></span><span></span></div>'],
  ['Candle Grow','ローソク足成長','Data','株価、レンジ、比較','ローソク足が中央から伸びるようにして','candle-grow','custom',
    '<div class="preview-motion candle-grow pv-candles"><span></span><span></span><span></span><span></span><span></span></div>'],
  ['Percent Ring','パーセントリング','Data','達成率、スコア、使用量','リングが達成率まで描かれるようにして','percent-ring','custom',
    '<div class="preview-motion percent-ring pv-donut pv-donut--partial"><svg viewBox="0 0 52 52" aria-hidden="true"><circle class="pv-donut-track" cx="26" cy="26" r="20"/><circle class="pv-donut-arc" cx="26" cy="26" r="20"/></svg><b>82</b></div>'],
  ['Border Beam','ボーダービーム','Button','注目CTA、プレミアム、新機能','ボタンの枠を光が一周するようにして','border-beam','custom',
    '<div class="preview-motion border-beam pv-beam"><span>Upgrade</span></div>'],
  ['Gradient Sweep Button','グラデスイープ','Button','主要CTA、キャンペーン','ボタン背景のグラデーションを流して','btn-gradient-sweep','custom',
    '<button class="preview-motion btn-gradient-sweep pv-grad-btn" type="button">Get started</button>'],
  ['Arrow Nudge','アローナッジ','Button','次へ、続きを読む、送る導線','ボタンの矢印が繰り返し右へナッジするようにして','arrow-nudge','custom',
    '<button class="preview-motion arrow-nudge pv-arrow-btn" type="button">Continue<span>→</span></button>'],
  ['Glow Pulse CTA','グローパルス','Button','最重要CTA、開始ボタン','ボタンの外側にグローが脈打つようにして','glow-pulse','custom',
    '<button class="preview-motion glow-pulse pv-glow-btn" type="button">Start</button>'],
  ['Button Shine','ボタンシャイン','Button','購入、登録、特別なアクション','ボタンに斜めの光が走るようにして','btn-shine','custom',
    '<button class="preview-motion btn-shine pv-shine-btn" type="button">Buy now</button>'],
  ['Number Stepper','数値ステッパー','Input','数量選択、人数、期間','ステッパーの数字がバンプして増減するようにして','number-stepper','custom',
    '<div class="preview-motion number-stepper pv-stepper-input"><span>−</span><b>12</b><span>＋</span></div>'],
  ['Strength Meter','強度メーター','Input','パスワード強度、品質スコア','強度メーターが段階的に色付くようにして','strength-meter','custom',
    '<div class="preview-motion strength-meter pv-strength"><span>••••••••</span><div><i></i><i></i><i></i></div></div>'],
  ['Tag Enter','タグ確定','Input','タグ入力、宛先、キーワード','入力テキストがEnterでチップに変わるようにして','tag-enter','custom',
    '<div class="preview-motion tag-enter pv-tag-enter"><span>design</span><i>design</i></div>'],
  ['Search Suggest','検索サジェスト','Input','検索補完、コマンド、住所','サジェスト候補の選択が上下に移動するようにして','search-suggest','custom',
    '<div class="preview-motion search-suggest pv-suggest"><span></span><ul><li>Tokyo</li><li>Toronto</li><li>Turin</li></ul></div>'],
  ['Input Clear Wipe','入力クリア','Input','検索リセット、フォームクリア','クリアボタンで文字が拭き取られるようにして','input-clear','custom',
    '<div class="preview-motion input-clear pv-clear"><span>motion catalog</span><i>×</i></div>'],
  ['Card Shine','カードシャイン','List','商品カード、特集、レアアイテム','カードに光が走るシャインを入れて','card-shine','custom',
    '<div class="preview-motion card-shine pv-card-shine"><span></span><i></i><b></b></div>'],
  ['Swipe Reveal Actions','スワイプアクション','List','メール、タスク、通知の操作','行をスワイプすると操作ボタンが現れるようにして','swipe-reveal','custom',
    '<div class="preview-motion swipe-reveal pv-swipe-row"><b></b><span></span></div>'],
  ['Drag Reorder Demo','ドラッグ並べ替え','List','優先順位、プレイリスト、手順','行を持ち上げて並べ替える動きを見せて','drag-reorder','custom',
    '<div class="preview-motion drag-reorder pv-reorder"><span></span><span></span><span></span></div>'],
  ['Notification Collapse','通知集約','List','通知センター、グループ化','複数の通知が一枚に集約されるようにして','notif-collapse','custom',
    '<div class="preview-motion notif-collapse pv-notif-stack"><span></span><span></span><span></span></div>'],
  ['List Load More','リスト追加読込','List','無限スクロール、もっと見る','末尾のプレースホルダが実データに変わるようにして','list-load-more','custom',
    '<div class="preview-motion list-load-more pv-loadmore"><span></span><span></span><i></i></div>'],
  ['Dock Magnify','ドック拡大','Navigation','ドック、ツールバー、ランチャー','ホバー位置のアイコンが拡大するドックにして','dock-magnify','custom',
    '<div class="preview-motion dock-magnify pv-dock"><span></span><span></span><span></span><span></span><span></span></div>'],
  ['Sidebar Collapse','サイドバー開閉','Navigation','管理画面、エディタ、設定','サイドバーがアイコン幅まで畳まれるようにして','sidebar-collapse','custom',
    '<div class="preview-motion sidebar-collapse pv-sidebar"><nav><i></i><i></i><i></i></nav><main></main></div>'],
  ['Tab Pill Morph','タブピルモーフ','Navigation','タブ、セグメント、期間切替','ピルが伸び縮みしながらタブ間を移動するようにして','tab-pill-morph','custom',
    '<div class="preview-motion tab-pill-morph pv-pill-tabs"><i></i><span>Day</span><span>Week</span><span>Month</span></div>'],
  ['Header Shrink','ヘッダー縮小','Navigation','スクロール時のヘッダー、アプリバー','スクロールでヘッダーがコンパクトになるようにして','header-shrink','custom',
    '<div class="preview-motion header-shrink pv-header-shrink"><header><b></b><span></span></header><main><i></i><i></i><i></i></main></div>'],
  ['Text Blur In','テキストブラーイン','Text','ヒーローコピー、見出し','文字がぼけた状態からピントが合うようにして','text-blur-in','custom',
    '<div class="preview-motion text-blur-in pv-text">Focus</div>'],
  ['Text Wave','テキストウェーブ','Text','ロゴ、遊びのある見出し','文字が波打つように順に跳ねるようにして','text-wave','custom',
    '<div class="preview-motion text-wave pv-text-chars"><span>W</span><span>a</span><span>v</span><span>e</span><span>!</span></div>'],
  ['Char Pop','文字ポップ','Text','タイトル、達成メッセージ','一文字ずつポップして現れるようにして','char-pop','custom',
    '<div class="preview-motion char-pop pv-text-chars"><span>P</span><span>o</span><span>p</span><span>!</span></div>'],
  ['Strike Complete','取り消し完了','Text','タスク完了、チェックリスト','完了時に取り消し線が引かれて薄くなるようにして','strike-complete','custom',
    '<div class="preview-motion strike-complete pv-strike"><i></i><span>Write the docs</span></div>'],
  ['Error Border Pulse','エラーボーダーパルス','Feedback','入力エラー、必須項目','エラー欄の枠が赤くパルスするようにして','error-border-pulse','custom',
    '<div class="preview-motion error-border-pulse pv-error-input"><span></span></div>'],
  ['Undo Timer','取り消しタイマー','Feedback','削除の取り消し、送信取り消し','スナックバーの残り時間が減っていくようにして','undo-timer','custom',
    '<div class="preview-motion undo-timer pv-undo"><span>Deleted</span><b>Undo</b><i></i></div>'],
  ['Save Flash','保存フラッシュ','Feedback','自動保存、下書き保存','保存された瞬間に小さくフラッシュ表示して','save-flash','custom',
    '<div class="preview-motion save-flash pv-save"><span></span><i>Saved ✓</i></div>'],
  ['Double Tap Like','ダブルタップいいね','Feedback','写真、フィード、リール','ダブルタップでハートが弾けるようにして','double-tap-like','custom',
    '<div class="preview-motion double-tap-like pv-dtap"><span></span><i></i></div>'],
  ['Border Rotate','ボーダー回転','Visual','特集カード、AI機能、注目枠','グラデーションの枠がゆっくり回転するようにして','border-rotate','custom',
    '<div class="preview-motion border-rotate pv-border-rotate"><span></span></div>'],
  ['Holo Shine','ホロシャイン','Visual','カード、バッジ、レアリティ演出','ホログラムのような光沢が動くようにして','holo-shine','custom',
    '<div class="preview-motion holo-shine pv-holo"></div>'],
  ['Grain Drift','グレインドリフト','Visual','背景、フィルム風、質感','粒子ノイズが漂う質感を入れて','grain-drift','custom',
    '<div class="preview-motion grain-drift pv-grain"><span></span></div>'],
  ['Spotlight Sweep','スポットライトスイープ','Visual','ダークヒーロー、発表演出','暗いカードを光の帯が横切るようにして','spotlight-sweep','custom',
    '<div class="preview-motion spotlight-sweep pv-spot-sweep"><span></span></div>'],
  ['Duotone Fade','デュオトーンフェード','Media','ギャラリー、アートワーク、特集','画像のデュオトーンが切り替わるようにして','duotone-fade','custom',
    '<div class="preview-motion duotone-fade pv-duotone"><span></span></div>'],

  /* ── v2.2 additions (100) ── */
  ['Pinch Zoom Out','ピンチズームアウト','Gesture','画像、地図、プレビュー','ピンチアウトで縮小する感じを見せて','pinch-zoom-out','photo'],
  ['Two Finger Rotate','2本指回転','Gesture','画像編集、地図の回転','2本指で回転させる操作を見せて','two-finger-rotate','photo'],
  ['Edge Swipe Back','エッジスワイプ','Gesture','戻る操作、ナビゲーション','画面端からのスワイプで戻る動きにして','edge-swipe-back','phone'],
  ['Swipe To Archive','スワイプアーカイブ','Gesture','メール、タスク一覧','スワイプでアーカイブされる動きにして','swipe-archive','list'],
  ['Drag Snap Threshold','ドラッグスナップ閾値','Gesture','スライダー、ボトムシート','一定量ドラッグしたらスナップするようにして','drag-snap-threshold','slider'],
  ['Force Touch Press','強めのプレス','Gesture','プレビュー表示、クイックアクション','強く押し込むとプレビューが持ち上がるようにして','force-touch','card'],
  ['Flick Dismiss','フリック退場','Gesture','カード評価、通知削除','素早くフリックして消える動きにして','flick-dismiss','card'],
  ['Two Finger Pan','2本指パン','Gesture','地図、キャンバス操作','2本指でパンする動きを見せて','two-finger-pan','scene'],
  ['Iris Reveal','アイリスリビール','Reveal','動画導入、注目シーン','円が開いてリビールするようにして','iris-reveal','circle'],
  ['Letter Mask Reveal','文字マスクリビール','Reveal','見出し、ロゴ表示','文字の形にマスクされて中身が見えるようにして','letter-mask-reveal','text'],
  ['Diagonal Wipe Reveal','斜めワイプリビール','Reveal','セクション切替、バナー','斜め方向にワイプしてリビールして','diagonal-wipe','panel'],
  ['Venetian Blinds Reveal','ブラインドリビール','Reveal','画像、特集セクション','ブラインドが開くようにリビールして','venetian-blinds','panel'],
  ['Puzzle Piece Reveal','パズルリビール','Reveal','ギャラリー、グリッド一覧','パズルのピースが揃うように表示して','puzzle-reveal','grid'],
  ['Ink Bleed Reveal','インク滲みリビール','Reveal','ブランド見出し、アート系UI','インクが滲むようにリビールして','ink-bleed','panel'],
  ['Zigzag Reveal','ジグザグリビール','Reveal','バナー、カード','ジグザグ状にリビールして','zigzag-reveal','panel'],
  ['Pixelate Reveal','ピクセレートリビール','Reveal','画像、デジタル演出','ピクセルが集まって画像になるようにして','pixelate-reveal','photo'],
  ['Cursor Ring Grow','カーソルリング拡大','Cursor','ホバー領域、インタラクティブ要素','カーソル周りのリングが拡大するようにして','cursor-ring-grow','cursor'],
  ['Cursor Blend Invert','カーソル反転ブレンド','Cursor','ダークUI、アート系サイト','カーソルが背景色を反転させるようにして','cursor-blend-invert','cursor'],
  ['Cursor Text Morph','カーソルテキスト変形','Cursor','リンクホバー、詳細を見る','カーソルがテキストラベルに変形するようにして','cursor-text-morph','cursor'],
  ['Cursor Click Ripple','カーソルクリックリップル','Cursor','クリック演出、フィードバック','クリック位置からリップルが広がるようにして','cursor-click-ripple','cursor'],
  ['Cursor Magnet Snapback','カーソルマグネット戻り','Cursor','ボタン、アイコンのホバー','離れると弾かれるように戻るマグネット効果にして','cursor-magnet-snapback','trail'],
  ['Cursor Hide On Type','入力中カーソル非表示','Cursor','エディタ、入力中の集中','入力中はカーソルがフェードアウトするようにして','cursor-hide-type','cursor'],
  ['Cursor Crosshair','カーソルクロスヘア','Cursor','画像編集、精密操作','カーソルを十字線に切り替えて','cursor-crosshair','cursor'],
  ['Cursor Zoom Lens','カーソルズームレンズ','Cursor','商品画像、地図の拡大','カーソル位置がレンズのように拡大されるようにして','cursor-zoom-lens','spotlight'],
  ['Lightbox Zoom Open','ライトボックスズーム','Media','画像ギャラリー、商品詳細','サムネイルからライトボックスへズームして開くようにして','lightbox-zoom','photo'],
  ['Video Play Bounce','動画再生バウンス','Media','動画サムネイル、プレイヤー','再生ボタンが押されるとバウンスするようにして','video-play-bounce','photo'],
  ['Picture In Picture Dock','ピクチャーインピクチャー','Media','動画通話、動画再生','動画が縮小して隅にドッキングするようにして','pip-dock','photo'],
  ['Gallery Swipe Peek','ギャラリースワイプピーク','Media','画像ギャラリー、商品写真','次の画像が少し見えるスワイプにして','gallery-swipe-peek','gallery'],
  ['Audio Waveform Pulse','音声波形パルス','Media','ボイスメッセージ、通話中','音声波形が音量に合わせて脈打つようにして','audio-waveform-pulse','wave'],
  ['Video Buffer Spin','動画バッファリング','Media','動画読み込み中','バッファリング中のスピナーを見せて','video-buffer-spin','photo'],
  ['Thumbnail Hover Zoom','サムネイルホバーズーム','Media','商品一覧、ギャラリー','ホバーでサムネイルが拡大するようにして','thumbnail-hover-zoom','photo'],
  ['Fullscreen Expand','フルスクリーン展開','Media','動画、画像ビューア','フルスクリーンへ滑らかに拡大するようにして','fullscreen-expand','photo'],
  ['Scroll Snap Section','スクロールスナップ','Scroll','フルページ、ストーリー型LP','セクションごとにスナップするスクロールにして','scroll-snap-section','panel'],
  ['Scroll Velocity Blur','スクロール速度ブラー','Scroll','高速スクロール演出','速くスクロールすると少しブラーがかかるようにして','scroll-velocity-blur','block'],
  ['Scroll Horizontal Track','横スクロールトラック','Scroll','ギャラリー、タイムライン','縦スクロールに連動して横に動くセクションにして','scroll-horizontal-track','panel'],
  ['Scroll Pin Card','スクロールピン留め','Scroll','比較セクション、手順','カードが固定されたまま次に切り替わるようにして','scroll-pin-card','panel'],
  ['Scroll Counter Increment','スクロール連動カウント','Scroll','実績数値、統計','スクロールで数字がカウントアップするようにして','scroll-counter','number'],
  ['Scroll Nav Highlight','スクロールナビハイライト','Scroll','目次、アンカーナビ','現在地に応じてナビがハイライトされるようにして','scroll-nav-highlight','link'],
  ['Scroll Progress Ring','スクロール進捗リング','Scroll','記事、長いページ','円形の読了率インジケーターにして','scroll-progress-ring','ring'],
  ['Scroll Rotate In','スクロール回転イン','Scroll','画像、アイコン、装飾','スクロールに応じて回転しながら現れるようにして','scroll-rotate-in','block'],
  ['Dropdown Cascade','ドロップダウンカスケード','Menu','設定メニュー、選択肢一覧','メニュー項目が順番にカスケード表示されるようにして','dropdown-cascade','menu'],
  ['Mega Menu Column Reveal','メガメニュー列リビール','Menu','ECサイト、カテゴリナビ','メガメニューの列が順にリビールされるようにして','mega-menu-column','menu'],
  ['Breadcrumb Overflow Collapse','パンくず折りたたみ','Menu','深い階層のナビゲーション','長いパンくずが折りたたまれて…になるようにして','breadcrumb-collapse','breadcrumb'],
  ['Nested Submenu Slide','ネストサブメニュー','Menu','多階層メニュー、設定','サブメニューが横にスライドして開くようにして','nested-submenu-slide','menu'],
  ['Context Menu Item Stagger','コンテキストメニュー展開','Menu','右クリックメニュー','メニュー項目が順番にスタッガー表示されるようにして','context-menu-stagger','menu'],
  ['Menu Icon Morph','メニューアイコン変形','Menu','ハンバーガーメニュー','ハンバーガーアイコンがXに変形するようにして','menu-icon-morph','menu'],
  ['Menu Active Indicator Glide','メニューインジケーター移動','Menu','サイドメニュー、タブ','選択中インジケーターが滑らかに移動するようにして','menu-indicator-glide','tabs'],
  ['Masonry Reflow','メーソンリー再配置','Layout','画像ギャラリー、Pinterest風一覧','フィルター時にメーソンリーが再配置されるようにして','masonry-reflow','grid'],
  ['Bento Grid Resize','ベントグリッドリサイズ','Layout','ダッシュボード、特集ページ','ベントグリッドのタイルが拡大縮小するようにして','bento-grid-resize','grid'],
  ['Split View Drag','分割ビュードラッグ','Layout','エディタ、比較画面','境界線をドラッグして分割比率が変わるようにして','split-view-drag','panel'],
  ['Grid To List Toggle','グリッドリスト切替','Layout','商品一覧、ファイル一覧','グリッド表示とリスト表示が切り替わるようにして','grid-list-toggle','grid'],
  ['Kanban Column Collapse','カンバン列折りたたみ','Layout','タスク管理、プロジェクト管理','カンバンの列が折りたためるようにして','kanban-column-collapse','card'],
  ['Responsive Stack Collapse','レスポンシブ縦積み','Layout','モバイル表示、レスポンシブ','横並びが縦積みに変わる遷移を見せて','responsive-stack-collapse','grid'],
  ['Card Grid Reflow','カードグリッド再配置','Layout','検索結果、フィルター一覧','削除・追加時にカードグリッドが再配置されるようにして','card-grid-reflow','grid'],
  ['Bottom Nav Highlight','ボトムナビハイライト','Navigation','モバイルアプリの下部ナビ','選択中のタブアイコンがハイライトされるようにして','bottom-nav-highlight','tabs'],
  ['Stepper Wizard Progress','ステッパーウィザード','Navigation','複数ステップの登録フロー','ウィザードのステッパーが順に進むようにして','stepper-wizard','breadcrumb'],
  ['Nav Rail Expand','ナビレール展開','Navigation','デスクトップアプリ、管理画面','折りたたみナビレールがラベル付きに展開するようにして','nav-rail-expand','drawer'],
  ['Tab Overflow Scroll','タブオーバーフロースクロール','Navigation','多数のタブ、ブラウザ風UI','収まらないタブが横スクロールできるようにして','tab-overflow-scroll','tabs'],
  ['Route Transition Fade Through','ルート遷移フェードスルー','Navigation','SPAのページ遷移','一度暗くなってから次のページに変わる遷移にして','route-fade-through','page'],
  ['Back Gesture Preview','戻るジェスチャープレビュー','Navigation','iOSスタイルの戻る操作','戻るときに前の画面が少し覗くようにして','back-gesture-preview','page'],
  ['Marquee Text Loop','マーキーテキストループ','Text','ニュース速報、ロゴ列','テキストが横に流れ続けるマーキーにして','marquee-text-loop','marquee'],
  ['Kinetic Typography Bounce','キネティックタイポ','Text','動画字幕、広告コピー','単語ごとに弾みながら現れるタイポグラフィにして','kinetic-typo-bounce','words'],
  ['Highlight Underline Draw','ハイライト下線描画','Text','強調テキスト、引用','テキストの下にマーカーの線が引かれるようにして','highlight-underline-draw','text'],
  ['Text Split Reveal','テキスト分割リビール','Text','見出し、キャッチコピー','文字が上下に分割されて現れるようにして','text-split-reveal','text'],
  ['Gradient Text Loop','グラデーションテキストループ','Text','ブランド見出し、AI系UI','文字のグラデーションが流れ続けるようにして','gradient-text-loop','text'],
  ['Text Counter Roll','テキストカウンターロール','Text','統計、達成数値','数字が回転しながらカウントするようにして','text-counter-roll','ticker'],
  ['Ambient Gradient Drift','アンビエントグラデーション','Visual','背景演出、待機画面','背景のグラデーションがゆっくり漂うようにして','ambient-gradient-drift','panel'],
  ['Film Grain Toggle','フィルムグレイン切替','Visual','レトロ演出、フィルター','フィルムグレインのノイズが明滅するようにして','film-grain-toggle','panel'],
  ['Chromatic Aberration','色収差エフェクト','Visual','グリッチ演出、エラー表現','色収差がずれてから戻るようにして','chromatic-aberration','text'],
  ['Vignette Pulse','ビネットパルス','Visual','ダークUI、注目演出','周辺減光が脈打つようにして','vignette-pulse','panel'],
  ['Duotone Toggle','デュオトーン切替','Visual','写真フィルター、アート表現','デュオトーンのカラーが切り替わるようにして','duotone-toggle','panel'],
  ['Color Shift Loop','カラーシフトループ','Visual','背景、装飾要素','背景色が緩やかに変化し続けるようにして','color-shift-loop','panel'],
  ['Kanban Card Drag','カンバンカードドラッグ','List','タスク管理、進捗ボード','カードを別列にドラッグする動きを見せて','kanban-card-drag','card'],
  ['Virtualized List Scroll','仮想リストスクロール','List','大量データの一覧','スクロールに応じて行が入れ替わるようにして','virtualized-list-scroll','list'],
  ['List Group Collapse','リストグループ折りたたみ','List','カテゴリ別一覧、設定','グループ見出しで一覧が折りたためるようにして','list-group-collapse','list'],
  ['List Item Expand Inline','リスト項目インライン展開','List','FAQ、詳細付き一覧','行をタップするとその場で詳細が展開するようにして','list-item-expand-inline','list'],
  ['List Multi Select Check','リスト複数選択','List','メール一覧、ファイル管理','チェックボックスで複数選択できる見た目にして','list-multi-select','list'],
  ['List Pin To Top','リスト先頭固定','List','ピン留め、重要な項目','ピン留めした項目が先頭に移動するようにして','list-pin-top','list'],
  ['Funnel Chart Narrow','ファネルチャート','Data','コンバージョン分析、営業パイプライン','ファネルが段階的に狭まって描かれるようにして','funnel-chart','chart-bars'],
  ['Sankey Flow','サンキーダイアグラム','Data','資金フロー、ユーザー導線分析','サンキー図の帯が流れるように描かれるようにして','sankey-flow','chart-line'],
  ['Comparison Bars Race','比較バーレース','Data','ランキング、競合比較','バーが競い合うように伸びるレースチャートにして','comparison-bars-race','chart-bars'],
  ['Radar Chart Draw','レーダーチャート描画','Data','スキル評価、多角比較','レーダーチャートの多角形が描かれるようにして','radar-chart-draw','pie'],
  ['Scatter Plot Populate','散布図生成','Data','相関分析、統計','散布図の点が順に打たれるようにして','scatter-plot-populate','chart-line'],
  ['Waterfall Bars','ウォーターフォールチャート','Data','収支分析、増減の内訳','ウォーターフォール式に積み上がるバーにして','waterfall-bars','chart-bars'],
  ['Range Slider Fill Track','レンジスライダー塗り','Input','価格範囲、数量調整','スライダーのトラックが値に合わせて塗られるようにして','range-slider-fill','slider'],
  ['Multi Select Tag Add','複数選択タグ追加','Input','フィルター、宛先選択','選択のたびにタグが追加されていくようにして','multi-select-tag-add','autocomplete'],
  ['File Drop Zone Highlight','ファイルドロップゾーン','Input','ファイルアップロード','ファイルをドラッグすると枠がハイライトされるようにして','file-drop-highlight','input'],
  ['Color Picker Swatch Pop','カラーピッカースウォッチ','Input','テーマ設定、デザインツール','選択した色見本がポップするようにして','color-picker-pop','radio'],
  ['Date Picker Cell Select','日付ピッカー選択','Input','予約、カレンダー入力','カレンダーの日付セルが選択されるようにして','date-picker-select','grid'],
  ['Toggle Group Slide','トグルグループスライド','Input','フィルター切替、表示モード','選択中のトグルへ背景が滑るようにして','toggle-group-slide','switch'],
  ['Toast Stack Collapse','トーストスタック収納','Feedback','複数通知、まとめ表示','複数のトーストが1つに収納されるようにして','toast-stack-collapse','list'],
  ['Inline Field Validation','インライン検証','Feedback','フォーム入力中の確認','入力しながらリアルタイムに検証結果が出るようにして','inline-field-validation','input-error'],
  ['Progress Toast Update','進捗トースト更新','Feedback','アップロード、ダウンロード通知','トースト内の進捗が更新され続けるようにして','progress-toast-update','progress'],
  ['Retry Shake Button','リトライシェイクボタン','Feedback','通信エラー、失敗操作','失敗時にボタンが軽くシェイクして再試行を促すようにして','retry-shake-button','button'],
  ['Spotlight Pulse Ring','スポットライトパルスリング','Emphasis','オンボーディング、注目誘導','対象の周りにパルスするリングを出して','spotlight-pulse-ring','ring'],
  ['Badge Glow Loop','バッジグローループ','Emphasis','新着バッジ、プレミアム表示','バッジが継続的にグローするようにして','badge-glow-loop','dot'],
  ['New Item Sparkle','新着スパークル','Emphasis','新機能、新着アイテム','新着マークがキラッと光るようにして','new-item-sparkle','dot'],
  ['Attention Border Loop','注目ボーダーループ','Emphasis','フォーム未入力、必須項目','枠線が繰り返し注目を引くようにして','attention-border-loop','panel'],
  ['Button Morph To Loader','ボタンローダー変形','Button','送信、保存、非同期処理','ボタンが送信中にローダー形状へ変形するようにして','button-morph-loader','button-loader'],
  ['Button Icon Rotate Swap','ボタンアイコン回転入替','Button','更新、リフレッシュ操作','クリック後にアイコンが回転しながら入れ替わるようにして','button-icon-rotate-swap','button-icon'],
].map(([name, jpName, category, useFor, request, className, preview, html]) =>
  ({ name, jpName, category, useFor, request, className, preview, html })
)

/* ════════════════════════════════════════════════════════════
   Vendored library motions (see /vendor, all MIT licensed).
   Entries are generated from the official class lists so the
   catalog can reference the real, copyable class names.
════════════════════════════════════════════════════════════ */

/* ── Animate.css v4.1.1 ── */
const ANIMATE_ATTENTION = {
  bounce: 'バウンス', flash: 'フラッシュ', pulse: 'パルス', rubberBand: 'ラバーバンド',
  shakeX: '横シェイク', shakeY: '縦シェイク', headShake: 'ヘッドシェイク', swing: 'スイング',
  tada: 'タダ', wobble: 'ウォブル', jello: 'ジェロー', heartBeat: 'ハートビート',
}
const ANIMATE_BASES = {
  back: 'バック', bounce: 'バウンス', fade: 'フェード', flip: 'フリップ',
  lightSpeed: 'ライトスピード', rotate: 'ローテート', zoom: 'ズーム', slide: 'スライド', roll: 'ロール',
}
const ANIMATE_DIRS = {
  Up: '上', Down: '下', Left: '左', Right: '右',
  TopLeft: '左上', TopRight: '右上', BottomLeft: '左下', BottomRight: '右下',
  UpLeft: '左上', UpRight: '右上', DownLeft: '左下', DownRight: '右下',
  InRight: '右', InLeft: '左', OutRight: '右', OutLeft: '左', X: 'X軸', Y: 'Y軸',
}
const ANIMATE_NAMES = [
  'bounce','flash','pulse','rubberBand','shakeX','shakeY','headShake','swing','tada','wobble','jello','heartBeat',
  'backInDown','backInLeft','backInRight','backInUp','backOutDown','backOutLeft','backOutRight','backOutUp',
  'bounceIn','bounceInDown','bounceInLeft','bounceInRight','bounceInUp',
  'bounceOut','bounceOutDown','bounceOutLeft','bounceOutRight','bounceOutUp',
  'fadeIn','fadeInDown','fadeInDownBig','fadeInLeft','fadeInLeftBig','fadeInRight','fadeInRightBig','fadeInUp','fadeInUpBig',
  'fadeInTopLeft','fadeInTopRight','fadeInBottomLeft','fadeInBottomRight',
  'fadeOut','fadeOutDown','fadeOutDownBig','fadeOutLeft','fadeOutLeftBig','fadeOutRight','fadeOutRightBig','fadeOutUp','fadeOutUpBig',
  'fadeOutTopLeft','fadeOutTopRight','fadeOutBottomRight','fadeOutBottomLeft',
  'flip','flipInX','flipInY','flipOutX','flipOutY',
  'lightSpeedInRight','lightSpeedInLeft','lightSpeedOutRight','lightSpeedOutLeft',
  'rotateIn','rotateInDownLeft','rotateInDownRight','rotateInUpLeft','rotateInUpRight',
  'rotateOut','rotateOutDownLeft','rotateOutDownRight','rotateOutUpLeft','rotateOutUpRight',
  'hinge','jackInTheBox','rollIn','rollOut',
  'zoomIn','zoomInDown','zoomInLeft','zoomInRight','zoomInUp',
  'zoomOut','zoomOutDown','zoomOutLeft','zoomOutRight','zoomOutUp',
  'slideInDown','slideInLeft','slideInRight','slideInUp',
  'slideOutDown','slideOutLeft','slideOutRight','slideOutUp',
]

function animateEntry(name) {
  let jpName, category
  if (ANIMATE_ATTENTION[name]) {
    jpName = ANIMATE_ATTENTION[name]
    category = 'Emphasis'
  } else if (name === 'hinge') {
    jpName = 'ヒンジ'; category = 'Exit'
  } else if (name === 'jackInTheBox') {
    jpName = 'ジャックインザボックス'; category = 'Entrance'
  } else if (name === 'flip') {
    jpName = 'フリップ'; category = 'Layout'
  } else {
    const m = name.match(/^(back|bounce|fade|flip|lightSpeed|rotate|zoom|slide|roll)(In|Out)((?:Down|Up|Left|Right|Top|Bottom|X|Y)*)?(Big)?$/)
    const base = ANIMATE_BASES[m[1]]
    const inOut = m[2] === 'In' ? 'イン' : 'アウト'
    const dir = m[3] ? (ANIMATE_DIRS[m[3]] || m[3]) : ''
    jpName = `${base}${inOut}${dir}${m[4] ? '(大)' : ''}`
    category = m[2] === 'In' ? 'Entrance' : 'Exit'
  }
  const useFor = {
    Entrance: 'カード、モーダル、通知の登場',
    Exit: '閉じる、削除、退場の演出',
    Emphasis: '注目喚起、通知、リアクション',
    Layout: 'カード反転、状態の切り替え',
  }[category]
  const cls = `animate__${name}`
  return {
    name, jpName, category, useFor,
    request: `Animate.cssの ${name} で動かして`,
    className: cls,
    copyClasses: `animate__animated ${cls}`,
    source: 'Animate.css',
    html: `<div class="preview-motion lib-box animate__animated animate__infinite ${cls}"></div>`,
  }
}

/* ── Hover.css v2.3.2 ── */
const HOVER_JP = {
  grow: '拡大', shrink: '縮小', pulse: 'パルス', 'pulse-grow': 'パルス拡大', 'pulse-shrink': 'パルス縮小',
  push: 'プッシュ', pop: 'ポップ', 'bounce-in': 'バウンスイン', 'bounce-out': 'バウンスアウト',
  rotate: '回転', 'grow-rotate': '拡大回転', float: 'フロート', sink: 'シンク', bob: 'ボブ', hang: 'ハング',
  skew: 'スキュー', 'skew-forward': '前傾スキュー', 'skew-backward': '後傾スキュー',
  'wobble-vertical': '縦ウォブル', 'wobble-horizontal': '横ウォブル',
  'wobble-to-bottom-right': '右下ウォブル', 'wobble-to-top-right': '右上ウォブル',
  'wobble-top': '上ウォブル', 'wobble-bottom': '下ウォブル', 'wobble-skew': 'スキューウォブル',
  buzz: 'バズ振動', 'buzz-out': 'バズアウト', forward: '前進', backward: '後退',
  fade: 'フェード', 'back-pulse': 'バックパルス',
  'sweep-to-right': '右スイープ', 'sweep-to-left': '左スイープ', 'sweep-to-bottom': '下スイープ', 'sweep-to-top': '上スイープ',
  'bounce-to-right': '右バウンス', 'bounce-to-left': '左バウンス', 'bounce-to-bottom': '下バウンス', 'bounce-to-top': '上バウンス',
  'radial-out': '放射アウト', 'radial-in': '放射イン', 'rectangle-in': '矩形イン', 'rectangle-out': '矩形アウト',
  'shutter-in-horizontal': '横シャッターイン', 'shutter-out-horizontal': '横シャッターアウト',
  'shutter-in-vertical': '縦シャッターイン', 'shutter-out-vertical': '縦シャッターアウト',
  'border-fade': '枠線フェード', hollow: 'ホロウ', trim: 'トリム',
  'ripple-out': 'リップルアウト', 'ripple-in': 'リップルイン', 'outline-out': 'アウトラインアウト', 'outline-in': 'アウトラインイン',
  'round-corners': '角丸化', 'underline-from-left': '下線(左から)', 'underline-from-center': '下線(中央から)',
  'underline-from-right': '下線(右から)', 'overline-from-left': '上線(左から)', 'overline-from-center': '上線(中央から)',
  'overline-from-right': '上線(右から)', reveal: '枠リビール', 'underline-reveal': '下線リビール', 'overline-reveal': '上線リビール',
  glow: 'グロー', shadow: 'シャドウ', 'grow-shadow': '拡大シャドウ',
  'box-shadow-outset': '外シャドウ', 'box-shadow-inset': '内シャドウ', 'float-shadow': '浮遊シャドウ', 'shadow-radial': '放射シャドウ',
  'bubble-top': '吹き出し上', 'bubble-right': '吹き出し右', 'bubble-bottom': '吹き出し下', 'bubble-left': '吹き出し左',
  'bubble-float-top': '浮遊吹き出し上', 'bubble-float-right': '浮遊吹き出し右',
  'bubble-float-bottom': '浮遊吹き出し下', 'bubble-float-left': '浮遊吹き出し左',
  'icon-back': 'アイコン後退', 'icon-forward': 'アイコン前進', 'icon-down': 'アイコン下', 'icon-up': 'アイコン上',
  'icon-spin': 'アイコンスピン', 'icon-drop': 'アイコンドロップ', 'icon-fade': 'アイコンフェード',
  'icon-float-away': 'アイコン飛去', 'icon-sink-away': 'アイコン沈下消失', 'icon-grow': 'アイコン拡大',
  'icon-shrink': 'アイコン縮小', 'icon-pulse': 'アイコンパルス', 'icon-pulse-grow': 'アイコンパルス拡大',
  'icon-pulse-shrink': 'アイコンパルス縮小', 'icon-push': 'アイコンプッシュ', 'icon-pop': 'アイコンポップ',
  'icon-bounce': 'アイコンバウンス', 'icon-rotate': 'アイコン回転', 'icon-grow-rotate': 'アイコン拡大回転',
  'icon-float': 'アイコンフロート', 'icon-sink': 'アイコンシンク', 'icon-bob': 'アイコンボブ', 'icon-hang': 'アイコンハング',
  'icon-wobble-horizontal': 'アイコン横ウォブル', 'icon-wobble-vertical': 'アイコン縦ウォブル',
  'icon-buzz': 'アイコンバズ', 'icon-buzz-out': 'アイコンバズアウト',
  'curl-top-left': 'カール左上', 'curl-top-right': 'カール右上',
  'curl-bottom-right': 'カール右下', 'curl-bottom-left': 'カール左下',
}

function hoverEntry(name) {
  const cls = `hvr-${name}`
  let html, useFor
  if (name.startsWith('icon-')) {
    useFor = 'アイコン付きボタン、リンクのホバー'
    html = `<button class="preview-motion lib-btn ${cls}" type="button">Next <span class="hvr-icon lib-icon">➔</span></button>`
  } else if (name.startsWith('bubble-')) {
    useFor = 'ツールチップ、吹き出しのホバー表示'
    html = `<div class="preview-motion lib-card ${cls}"></div>`
  } else if (name.startsWith('curl-')) {
    useFor = 'ページカール、めくり演出'
    html = `<div class="preview-motion lib-card ${cls}"></div>`
  } else {
    useFor = 'ボタン、リンク、カードのホバー'
    html = `<button class="preview-motion lib-btn ${cls}" type="button">Hover</button>`
  }
  return {
    name: cls, jpName: `ホバー: ${HOVER_JP[name] || name}`, category: 'Hover', useFor,
    request: `Hover.cssの ${name} をホバー効果に使って`,
    className: cls,
    copyClasses: cls,
    source: 'Hover.css',
    html,
  }
}

const HOVER_NAMES = Object.keys(HOVER_JP)

/* ── SpinKit v2.0.1 ── */
const SPINKIT = [
  ['plane', 'プレーン', '<div class="sk-plane"></div>'],
  ['chase', 'チェイス', `<div class="sk-chase">${'<div class="sk-chase-dot"></div>'.repeat(6)}</div>`],
  ['bounce', 'バウンス', `<div class="sk-bounce">${'<div class="sk-bounce-dot"></div>'.repeat(2)}</div>`],
  ['wave', 'ウェーブ', `<div class="sk-wave">${'<div class="sk-wave-rect"></div>'.repeat(5)}</div>`],
  ['pulse', 'パルス', '<div class="sk-pulse"></div>'],
  ['flow', 'フロー', `<div class="sk-flow">${'<div class="sk-flow-dot"></div>'.repeat(3)}</div>`],
  ['swing', 'スウィング', `<div class="sk-swing">${'<div class="sk-swing-dot"></div>'.repeat(2)}</div>`],
  ['circle', 'サークル', `<div class="sk-circle">${'<div class="sk-circle-dot"></div>'.repeat(12)}</div>`],
  ['circle-fade', 'サークルフェード', `<div class="sk-circle-fade">${'<div class="sk-circle-fade-dot"></div>'.repeat(12)}</div>`],
  ['grid', 'グリッド', `<div class="sk-grid">${'<div class="sk-grid-cube"></div>'.repeat(9)}</div>`],
  ['fold', 'フォールド', `<div class="sk-fold">${'<div class="sk-fold-cube"></div>'.repeat(4)}</div>`],
  ['wander', 'ワンダー', `<div class="sk-wander">${'<div class="sk-wander-cube"></div>'.repeat(3)}</div>`],
]

function spinkitEntry([name, jp, inner]) {
  // Collect every sk-* class in the markup so Copy CSS includes child rules
  const innerClasses = [...new Set([...inner.matchAll(/class="([^"]+)"/g)].map(m => m[1]))]
  return {
    name: `sk-${name}`, jpName: `SpinKitローダー: ${jp}`, category: 'Loading',
    useFor: 'ローディング、待機、処理中',
    request: `SpinKitの ${name} ローダーを使って`,
    className: `sk-${name}`,
    copyClasses: innerClasses.join(' '),
    source: 'SpinKit',
    html: `<div class="preview-motion lib-spinner">${inner}</div>`,
  }
}

/* ── CSShake v1.7.0 ── */
const CSSHAKE = [
  ['shake', 'シェイク'], ['shake-slow', 'ゆっくりシェイク'], ['shake-little', '小刻みシェイク'],
  ['shake-hard', 'ハードシェイク'], ['shake-horizontal', '横シェイク'], ['shake-vertical', '縦シェイク'],
  ['shake-rotate', '回転シェイク'], ['shake-opacity', '透明シェイク'],
  ['shake-crazy', 'クレイジーシェイク'], ['shake-chunk', 'チャンクシェイク'],
]

function csshakeEntry([cls, jp]) {
  return {
    name: cls, jpName: `CSShake: ${jp}`, category: 'Feedback',
    useFor: 'エラー、注意喚起、警告、遊びの演出',
    request: `CSShakeの ${cls} で揺らして`,
    className: cls,
    copyClasses: cls,
    source: 'CSShake',
    html: `<div class="preview-motion lib-box ${cls} shake-constant"></div>`,
  }
}

ANIMATE_NAMES.forEach(n => motions.push(animateEntry(n)))
HOVER_NAMES.forEach(n => motions.push(hoverEntry(n)))
SPINKIT.forEach(row => motions.push(spinkitEntry(row)))
CSSHAKE.forEach(row => motions.push(csshakeEntry(row)))

/* ════════════════════════════════════════════════════════════
   Three.js / WebGL motions. The metadata lives here so search,
   filters, URL state, and copy actions share the 2D catalog UI.
   Rendering is handled by /three-catalog.js with one WebGL
   renderer shared across every visible preview.
════════════════════════════════════════════════════════════ */
const THREE_CATEGORIES = [
  'Transform', 'Camera', 'Lighting', 'Material',
  'Particles', 'Geometry', 'Spatial UI', 'Physics',
]

const threeTargets = [
  { id: 'object', label: 'オブジェクト', short: 'Object' },
  { id: 'camera', label: 'カメラ', short: 'Camera' },
  { id: 'light', label: 'ライト', short: 'Light' },
  { id: 'material', label: 'マテリアル', short: 'Material' },
  { id: 'particles', label: 'パーティクル', short: 'Particles' },
  { id: 'geometry', label: 'ジオメトリ', short: 'Geometry' },
  { id: 'spatial-ui', label: '空間UI', short: 'Spatial UI' },
  { id: 'physics', label: '物理表現', short: 'Physics' },
]

const THREE_MOTION_ROWS = [
  ['Continuous Y Rotation','Y軸連続回転','Transform','商品ビュー、ロゴ、3Dアイコン','オブジェクトをY軸で一定速度に回転させて','rotate-y','object','4s · linear · ∞',
    'object.rotation.y = t * 1.5'],
  ['Multi Axis Spin','多軸スピン','Transform','ローダー、抽象オブジェクト、トランジション','X/Y/Zの異なる速度で多軸回転させて','multi-axis-spin','object','5s · linear · ∞',
    'object.rotation.set(t * 0.7, t * 1.1, t * 0.35)'],
  ['Object Orbit','オブジェクト周回','Transform','衛星、関係図、プロダクト構成','中心オブジェクトの周りを小さな要素が周回するようにして','object-orbit','object','6s · sine · ∞',
    'object.position.set(Math.cos(t) * 1.5, 0, Math.sin(t) * 1.5)'],
  ['Spring Scale','スプリングスケール','Transform','3Dボタン、選択、配置完了','3Dオブジェクトが柔らかく拡大して定位置に収まるようにして','spring-scale','object','2.4s · damped · ∞',
    'object.scale.setScalar(1 + Math.sin(t * 3) * Math.exp(-(t % 2.4)) * 0.35)'],
  ['Squash & Stretch','スクワッシュ＆ストレッチ','Transform','キャラクター、ボール、遊びのある反応','上下運動に合わせて潰れと伸びを付けて','squash-stretch','object','2s · sine · ∞',
    'object.scale.set(1 + Math.sin(t * 3) * 0.18, 1 - Math.sin(t * 3) * 0.24, 1 + Math.sin(t * 3) * 0.18)'],
  ['Float Bob','フロートボブ','Transform','空中カード、3Dアイコン、待機状態','ゆっくり浮遊しながら少し傾く待機モーションにして','float-bob','object','4s · sine · ∞',
    'object.position.y = Math.sin(t * 1.5) * 0.35; object.rotation.z = Math.sin(t) * 0.12'],
  ['Helix Rise','らせん上昇','Transform','生成、アップロード、レベルアップ','らせん軌道を描きながら上昇する動きにして','helix-rise','object','5s · linear · ∞',
    'object.position.set(Math.cos(t * 2), (t % 2.5) - 1.25, Math.sin(t * 2))'],
  ['Pendulum Swing','振り子スイング','Transform','メニュー、吊り下げ表示、物理的な待機','支点から振り子のように往復するようにして','pendulum-swing','object','3s · sine · ∞',
    'object.rotation.z = Math.sin(t * 2) * 0.65'],
  ['Card Flip','3Dカードフリップ','Transform','カード詳細、before/after、状態切替','カードをY軸で裏返して反対面を見せて','card-flip','object','3s · in-out · ∞',
    'object.rotation.y = (1 - Math.cos(t * 2)) * Math.PI * 0.5'],
  ['Explode & Assemble','分解と再構成','Transform','プロダクト分解図、ロゴ、ロード完了','パーツが外側へ分解してから元に組み上がるようにして','explode-assemble','object','4s · in-out · ∞',
    'object.children.forEach((part, i) => part.position.x = Math.sin(t * 1.5) * (i - 2) * 0.55)'],

  ['Camera Orbit','カメラオービット','Camera','製品紹介、建築、3Dギャラリー','カメラが被写体の周囲を一定半径で回り込むようにして','camera-orbit','camera','7s · linear · ∞',
    'camera.position.set(Math.cos(t * 0.7) * 5, 2, Math.sin(t * 0.7) * 5); camera.lookAt(0, 0, 0)'],
  ['Dolly In','ドリーイン','Camera','シーン導入、注目、詳細表示','カメラを被写体へ滑らかに近づけて','dolly-in','camera','3s · in-out · ∞',
    'camera.position.z = 5 - (Math.sin(t) * 0.5 + 0.5) * 2'],
  ['Truck Pan','トラックパン','Camera','横長シーン、ギャラリー、比較','カメラを向きを保ったまま左右へ平行移動して','truck-pan','camera','4s · sine · ∞',
    'camera.position.x = Math.sin(t) * 2; camera.lookAt(camera.position.x, 0, 0)'],
  ['Crane Rise','クレーンライズ','Camera','俯瞰への切替、建築、シーン全体表示','カメラを上昇させながら俯瞰へ切り替えて','crane-rise','camera','4s · in-out · ∞',
    'camera.position.y = 1.5 + (Math.sin(t) * 0.5 + 0.5) * 3; camera.lookAt(0, 0, 0)'],
  ['Handheld Shake','ハンドヘルドシェイク','Camera','衝撃、ゲーム演出、警告','短く減衰するハンドヘルド風のカメラシェイクを入れて','camera-shake','camera','1.2s · damped · ∞',
    'camera.position.x = Math.sin(t * 35) * 0.04; camera.position.y = Math.cos(t * 29) * 0.035'],
  ['Layer Parallax','レイヤーパララックス','Camera','奥行きのあるUI、ヒーロー、空間ナビ','カメラ移動に合わせて奥行き別に視差を付けて','layer-parallax','camera','5s · sine · ∞',
    'camera.position.x = Math.sin(t * 0.8) * 1.2; camera.lookAt(0, 0, 0)'],

  ['Light Sweep','ライトスイープ','Lighting','プロダクトリビール、ロゴ、質感紹介','細いライトが表面を横切って形状を見せるようにして','light-sweep','light','4s · in-out · ∞',
    'light.position.x = Math.sin(t) * 4'],
  ['Rim Light Pulse','リムライトパルス','Lighting','選択状態、エネルギー、注目オブジェクト','輪郭のリムライトがゆっくり脈打つようにして','rim-light-pulse','light','3s · sine · ∞',
    'material.emissiveIntensity = 0.25 + (Math.sin(t * 2) * 0.5 + 0.5) * 1.2'],
  ['Orbiting Point Light','周回ポイントライト','Lighting','立体感の提示、検査、シーン待機','ポイントライトを被写体の周りに周回させて','point-light-orbit','light','6s · linear · ∞',
    'light.position.set(Math.cos(t) * 3, 1.5, Math.sin(t) * 3)'],
  ['Shadow Dance','シャドウダンス','Lighting','時刻変化、建築、印象的な背景','ライト移動に合わせて影が回り込むようにして','shadow-dance','light','5s · sine · ∞',
    'light.position.set(Math.sin(t) * 3, 4, Math.cos(t) * 3)'],
  ['Color Temperature Shift','色温度シフト','Lighting','時間帯、ムード切替、環境変化','照明を暖色から寒色へゆっくり切り替えて','temperature-shift','light','5s · sine · ∞',
    'light.color.setHSL(0.08 + (Math.sin(t) * 0.5 + 0.5) * 0.52, 0.75, 0.62)'],

  ['Emissive Pulse','エミッシブパルス','Material','通知、エネルギー、ホログラム','マテリアルの発光強度を滑らかに脈動させて','emissive-pulse','material','2.5s · sine · ∞',
    'material.emissiveIntensity = 0.2 + (Math.sin(t * 2.5) * 0.5 + 0.5) * 1.6'],
  ['Wireframe Reveal','ワイヤーフレームリビール','Material','モデル読込、設計ビュー、技術表現','ワイヤーフレームからソリッドへ切り替わるようにして','wireframe-reveal','material','4s · in-out · ∞',
    'material.opacity = 0.35 + (Math.sin(t) * 0.5 + 0.5) * 0.65'],
  ['Point Dissolve','ポイントディゾルブ','Material','出現、消失、テレポート','表面がポイントにほどけて消えるようにして','point-dissolve','material','4s · in-out · ∞',
    'object.scale.setScalar(0.7 + (Math.sin(t) * 0.5 + 0.5) * 0.45)'],
  ['Hologram Scan','ホログラムスキャン','Material','AR表示、解析、未来的なプレビュー','水平スキャンラインがモデルを通過するホログラム表現にして','hologram-scan','material','3s · linear · ∞',
    'material.opacity = 0.55 + Math.sin(t * 8) * 0.2'],
  ['Fresnel Shift','フレネルシフト','Material','透明体、エネルギー、輪郭強調','視線角度に応じて輪郭色が変わるフレネル表現にして','fresnel-shift','material','5s · sine · ∞',
    'object.rotation.y = t * 0.7; material.opacity = 0.65 + Math.sin(t * 2) * 0.2'],
  ['Glass Refraction','ガラス屈折','Material','ガラスUI、製品、透明カード','透明なガラス材質が背景を屈折して見せるようにして','glass-refraction','material','5s · sine · ∞',
    'object.rotation.set(Math.sin(t) * 0.2, t * 0.45, 0)'],

  ['Particle Orbit','パーティクル周回','Particles','エネルギー、データ、待機状態','多数の粒子が中心核の周囲を軌道運動するようにして','particle-orbit','particles','6s · linear · ∞',
    'object.rotation.y = t * 0.8'],
  ['Sine Wave Field','サイン波フィールド','Particles','音声、信号、データ可視化','粒子の面をサイン波が伝わるようにして','particle-wave','particles','4s · sine · ∞',
    'object.rotation.y = Math.sin(t * 0.4) * 0.25'],
  ['Vortex Funnel','ボルテックスファネル','Particles','吸い込み、ポータル、生成','粒子を渦巻きながら中心へ吸い込ませて','particle-vortex','particles','5s · in-out · ∞',
    'object.rotation.y = t * 1.6; object.scale.setScalar(0.9 + Math.sin(t) * 0.08)'],
  ['Particle Fountain','パーティクル噴水','Particles','達成、発生、噴射','粒子が中心から噴き上がって落下するようにして','particle-fountain','particles','3s · gravity · ∞',
    'object.rotation.y = t * 0.25'],
  ['Starfield Warp','スターフィールドワープ','Particles','高速移動、ページ遷移、没入導入','星が手前へ伸びるワープ速度表現にして','starfield-warp','particles','3s · accelerate · ∞',
    'object.position.z = (t * 2) % 4'],
  ['Confetti Burst','3Dコンフェッティ','Particles','大きな達成、公開、完了','紙片が3D空間へ一度広がって落ちるようにして','confetti-burst','particles','4s · gravity · ∞',
    'object.rotation.y = t * 0.3'],

  ['Cube to Sphere Morph','キューブ→球モーフ','Geometry','形状変化、モード切替、生成','キューブの頂点を球面へ補間してモーフさせて','cube-sphere-morph','geometry','4s · in-out · ∞',
    'object.scale.setScalar(0.9 + (Math.sin(t) * 0.5 + 0.5) * 0.15)'],
  ['Torus Twist','トーラスツイスト','Geometry','抽象ロゴ、ローダー、音楽ビジュアル','トーラスがねじれながら回転するようにして','torus-twist','geometry','5s · sine · ∞',
    'object.rotation.set(t * 0.45, t * 0.8, Math.sin(t) * 0.3)'],
  ['Wave Grid','ウェーブグリッド','Geometry','地形、データ面、背景','グリッド面を波が横切るように変形して','wave-grid','geometry','4s · sine · ∞',
    'object.rotation.z = Math.sin(t * 0.5) * 0.05'],
  ['Domino Chain','ドミノチェーン','Geometry','連鎖、手順、依存関係','ドミノが順番に倒れて連鎖するようにして','domino-chain','geometry','5s · stagger · ∞',
    'object.children.forEach((part, i) => part.rotation.z = Math.max(0, Math.sin(t * 1.4 - i * 0.25)) * 1.2)'],
  ['Stack Build','スタックビルド','Geometry','データ積上げ、ロード、構築','ブロックが下から順に積み上がるようにして','stack-build','geometry','4s · stagger · ∞',
    'object.children.forEach((part, i) => part.position.y = i * 0.45 - 1 + Math.sin(t * 2 - i * 0.3) * 0.08)'],
  ['Ribbon Flow','リボンフロー','Geometry','データフロー、ブランドライン、経路','細いリボン形状が空間を流れるように変形して','ribbon-flow','geometry','5s · sine · ∞',
    'object.rotation.y = Math.sin(t * 0.6) * 0.4'],

  ['3D Card Tilt','3Dカードチルト','Spatial UI','カード、商品、ダッシュボード','ポインター操作でカードが奥行きを保って傾くようにして','card-tilt-3d','spatial-ui','pointer · spring',
    'object.rotation.set(pointer.y * 0.25, pointer.x * 0.35, 0)'],
  ['Spatial Carousel','空間カルーセル','Spatial UI','作品一覧、商品、メディア','カードを円周上に並べて空間カルーセルとして回して','spatial-carousel','spatial-ui','6s · linear · ∞',
    'object.rotation.y = t * 0.55'],
  ['Radial Menu Depth','奥行きラジアルメニュー','Spatial UI','ツール選択、クリエイティブUI','メニュー項目を奥行き付きの円形に展開して','radial-menu-depth','spatial-ui','4s · in-out · ∞',
    'object.rotation.z = Math.sin(t * 0.7) * 0.18'],
  ['Modal Depth Push','モーダル奥行きプッシュ','Spatial UI','3Dアプリのモーダル、詳細表示','背景を奥へ押し込みながらモーダル面を手前に出して','modal-depth-push','spatial-ui','3s · in-out · ∞',
    'object.children[0].position.z = Math.sin(t) * 0.6; object.children[1].position.z = 0.8 - Math.sin(t) * 0.25'],
  ['3D Data Bars','3Dデータバー','Spatial UI','分析、ランキング、指標','3Dの棒グラフが順番に下から伸びるようにして','data-bars-3d','spatial-ui','4s · stagger · ∞',
    'object.children.forEach((bar, i) => bar.scale.y = 0.25 + (Math.sin(t * 1.6 - i * 0.25) * 0.5 + 0.5) * 0.75)'],
  ['Spatial Tooltip','空間ツールチップ','Spatial UI','3Dモデル注釈、製品説明、AR UI','3D位置に追従するツールチップ面を浮かせて','spatial-tooltip','spatial-ui','3s · sine · ∞',
    'object.children[1].position.y = 1.2 + Math.sin(t * 2) * 0.12'],

  ['Gravity Drop','重力ドロップ','Physics','配置、追加、落下演出','オブジェクトが重力で落下して床で小さく跳ねるようにして','gravity-drop','physics','2.8s · gravity · ∞',
    'object.position.y = Math.abs(Math.sin(t * 1.8)) * 2'],
  ['Collision Bounce','衝突バウンス','Physics','通知、ゲーム、物体接触','2つのオブジェクトが衝突して反対方向へ跳ね返るようにして','collision-bounce','physics','3s · collision · ∞',
    'object.children[0].position.x = Math.sin(t * 2) * 1.2; object.children[1].position.x = -Math.sin(t * 2) * 1.2'],
  ['Magnetic Attraction','磁力アトラクション','Physics','関連付け、スナップ、グルーピング','複数の要素が磁力で中心へ引き寄せられるようにして','magnetic-attraction','physics','4s · spring · ∞',
    'object.children.forEach((part, i) => part.position.multiplyScalar(0.98 + Math.sin(t + i) * 0.002))'],
  ['Cloth Wave','クロスウェーブ','Physics','布、旗、柔らかいサーフェス','布の頂点へ風が伝わる波を与えて','cloth-wave','physics','4s · sine · ∞',
    'object.rotation.y = Math.sin(t * 0.5) * 0.18'],
  ['Spring Chain','スプリングチェーン','Physics','接続ノード、ケーブル、追従UI','連結したノードが遅れて追従するスプリングチェーンにして','spring-chain','physics','4s · damped · ∞',
    'object.children.forEach((part, i) => part.position.y = Math.sin(t * 2 - i * 0.35) * 0.35)'],
]

function createThreeSnippet(motion) {
  return `import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
camera.position.set(0, 1.2, 5)

const material = new THREE.MeshStandardMaterial({
  color: 0x5271ff,
  roughness: 0.35,
  metalness: 0.15,
})
const object = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), material)
const light = new THREE.PointLight(0xffffff, 4)
light.position.set(3, 4, 4)
scene.add(object, light, new THREE.AmbientLight(0xffffff, 1.2))

// ${motion.name}
function animate(time) {
  const t = time / 1000
  ${motion.updateCode}
  renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)`
}

const threeMotions = THREE_MOTION_ROWS.map(
  ([name, jpName, category, useFor, request, key, target, spec, updateCode]) => {
    const motion = {
      name, jpName, category, useFor, request, key, spec, updateCode,
      className: key,
      preview: 'three',
      source: 'Three.js r184',
      targets: [target],
      dimension: '3d',
    }
    motion.code = createThreeSnippet(motion)
    return motion
  }
)

function motionText(motion) {
  return `${motion.name} ${motion.jpName} ${motion.category} ${motion.useFor} ${motion.request} ${motion.className} ${motion.source || ''}`.toLowerCase()
}

function hasAny(text, words) {
  return words.some(word => text.includes(word.toLowerCase()))
}

function deriveTargets(motion) {
  const text = motionText(motion)
  const tags = new Set()
  const buttonPreview = [
    'button', 'button-icon', 'button-label', 'button-loader', 'button-fill',
    'button-danger', 'button-split', 'button-segmented', 'button-count',
    'choice-expand', 'theme-toggle', 'heart', 'stars'
  ].includes(motion.preview)
  const buttonLike = motion.category === 'Button' || buttonPreview || hasAny(text, ['button', 'ボタン', 'tap', 'タップ', 'press', 'プレス'])

  if (buttonLike) tags.add('button')
  if (
    motion.category === 'Input' ||
    hasAny(text, ['input', '入力', 'form', 'フォーム', 'validation', '検証', 'password', 'パスワード', 'checkbox', 'radio', 'switch', 'label', 'ラベル', 'slider', 'スライダー'])
  ) tags.add('form')
  if (
    motion.category === 'Menu' ||
    hasAny(text, ['modal', 'モーダル', 'dialog', 'ダイアログ', 'drawer', 'ドロワー', 'sheet', 'シート', 'menu', 'メニュー', 'tooltip', 'ツールチップ', 'palette', 'パレット', 'fab'])
  ) tags.add('overlay')
  if (
    motion.category === 'Navigation' ||
    hasAny(text, ['page', 'ページ', 'nav', 'ナビ', 'tab', 'タブ', 'breadcrumb', 'パンくず', 'accordion', 'アコーディオン', 'transition', '遷移', 'stepper', 'ステップ'])
  ) tags.add('navigation')
  if (
    motion.category !== 'Input' &&
    hasAny(text, ['toast', 'トースト', 'notification', '通知', 'badge', 'バッジ', 'ping', 'ピング', 'warning', '警告', '新着', 'ライブ状態', 'ベル', 'アラート'])
  ) tags.add('notification')
  if (
    motion.category === 'List' ||
    motion.category === 'Layout' ||
    hasAny(text, ['card', 'カード', 'list', '一覧', 'row', '行', 'table', 'テーブル', 'grid', 'グリッド', 'reorder', '並べ替え', 'sort', 'ソート', 'チップ', 'アバター', '空状態'])
  ) tags.add('card-list')
  if (
    motion.category === 'Loading' ||
    hasAny(text, ['loading', 'ローディング', 'loader', 'ローダー', 'progress', '進捗', 'spinner', 'スピナー', 'skeleton', 'スケルトン', '処理中', '生成中', 'アップロード'])
  ) tags.add('loading')
  if (
    motion.category === 'Text' ||
    hasAny(text, ['text', 'テキスト', 'typewriter', 'タイプライター', 'letter', '文字', 'word', '単語', 'ticker'])
  ) tags.add('text')
  if (
    motion.category === 'Media' ||
    hasAny(text, ['image', '画像', 'photo', '写真', 'video', '動画', 'media', 'メディア', 'gallery', 'ギャラリー', 'carousel', 'カルーセル'])
  ) tags.add('media')
  if (
    motion.category === 'Data' ||
    hasAny(text, ['chart', 'グラフ', 'data', 'データ', '数値', 'number', '数字', 'count', 'カウント', 'gauge', 'ゲージ', 'heatmap', 'ヒートマップ', '評価', '価格'])
  ) tags.add('data')
  if (
    motion.category === 'Gesture' ||
    motion.category === 'Scroll' ||
    hasAny(text, ['gesture', 'ジェスチャー', 'scroll', 'スクロール', 'swipe', 'スワイプ', 'drag', 'ドラッグ', 'long press', '長押し', 'pinch', 'ピンチ'])
  ) tags.add('gesture')
  if (
    motion.category === 'Cursor' ||
    motion.category === 'Visual' ||
    hasAny(text, ['cursor', 'カーソル', 'hover', 'ホバー', 'glass', 'グラス', 'glitch', 'グリッチ', 'scan', 'スキャン', 'noise', 'ノイズ', 'aurora', 'オーロラ'])
  ) tags.add('cursor-visual')

  if (!tags.size) tags.add('card-list')
  return [...tags]
}

motions.forEach((motion, index) => {
  motion.id = index + 1
  motion.targets = deriveTargets(motion)
  motion.haystack = `${motionText(motion)} ${motion.targets
    .map(id => {
      const hit = targets.find(item => item.id === id)
      return hit ? `${hit.label} ${hit.short}` : ''
    })
    .join(' ')}`.toLowerCase()
})

threeMotions.forEach((motion, index) => {
  motion.id = index + 1
  motion.haystack = `${motionText(motion)} ${motion.targets
    .map(id => {
      const hit = threeTargets.find(item => item.id === id)
      return hit ? `${hit.label} ${hit.short}` : ''
    })
    .join(' ')}`.toLowerCase()
})

/* ── State ──────────────────────────────────────────────────── */
let activeDimension = '2d'
let activeTarget = 'All'
let activeCategory = 'All'
let speedRate = 1
let motionForced = false

/* ── DOM refs ───────────────────────────────────────────────── */
const grid          = document.getElementById('catalogGrid')
const searchInput   = document.getElementById('searchInput')
const searchClear   = document.getElementById('searchClear')
const targetEl      = document.getElementById('targetFilters')
const filtersEl     = document.getElementById('categoryFilters')
const replayAllBtn  = document.getElementById('replayAll')
const speedBtn      = document.getElementById('speedToggle')
const themeBtn      = document.getElementById('themeToggle')
const toastEl       = document.getElementById('toast')
const banner        = document.getElementById('reducedMotionBanner')
const enableBtn     = document.getElementById('enableMotion')
const emptyState    = document.getElementById('emptyState')
const resetBtn      = document.getElementById('resetFilters')
const resultCount   = document.getElementById('resultCount')
const dimensionTabs = document.querySelector('.dimension-tabs')
const dimensionIndex = document.getElementById('dimensionIndex')
const dimensionTitle = document.getElementById('dimensionTitle')
const dimensionDescription = document.getElementById('dimensionDescription')

function activeMotions() {
  return activeDimension === '3d' ? threeMotions : motions
}

function activeTargets() {
  return activeDimension === '3d' ? threeTargets : targets
}

function activeCategories() {
  return activeDimension === '3d' ? THREE_CATEGORIES : categories
}

function syncDimensionUI() {
  document.body.dataset.catalogDimension = activeDimension
  document.querySelectorAll('[data-dimension]').forEach(tab => {
    const selected = tab.dataset.dimension === activeDimension
    tab.setAttribute('aria-selected', String(selected))
    tab.tabIndex = selected ? 0 : -1
  })

  const isThree = activeDimension === '3d'
  dimensionIndex.textContent = isThree ? 'CATALOG / 3D' : 'CATALOG / 2D'
  dimensionTitle.textContent = isThree ? '3D Motion Lab' : '2D UI Motion'
  dimensionDescription.textContent = isThree
    ? 'WebGLの50シーンをその場で再生。プレビューをドラッグ、または矢印キーで視点を動かせます。'
    : 'CSSで扱えるUIモーションを、用途と実装コードから探せます。'
  searchInput.placeholder = isThree
    ? 'camera, particle, material, 物理, カード…'
    : 'ボタン, トースト, fade, 削除, 生成中…'
}

function setDimension(next) {
  if (!['2d', '3d'].includes(next) || next === activeDimension) return
  activeDimension = next
  activeTarget = 'All'
  activeCategory = 'All'
  searchInput.value = ''
  searchClear.hidden = true
  syncDimensionUI()
  refresh()
}

dimensionTabs.addEventListener('click', event => {
  const tab = event.target.closest('[data-dimension]')
  if (!tab) return
  setDimension(tab.dataset.dimension)
})

dimensionTabs.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  event.preventDefault()
  const next = activeDimension === '2d' ? '3d' : '2d'
  setDimension(next)
  dimensionTabs.querySelector(`[data-dimension="${next}"]`)?.focus()
})

/* ── Theme ──────────────────────────────────────────────────── */
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  themeBtn.setAttribute('aria-label', theme === 'dark' ? 'ライトテーマに切り替える' : 'ダークテーマに切り替える')
}

applyTheme(localStorage.getItem('mc-theme') || (prefersDark.matches ? 'dark' : 'light'))

themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  localStorage.setItem('mc-theme', next)
  applyTheme(next)
})

/* ── Reduced Motion ─────────────────────────────────────────── */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')

function shouldAnimate() {
  return motionForced || !prefersReduced.matches
}

if (!shouldAnimate()) {
  banner.removeAttribute('hidden')
}

enableBtn.addEventListener('click', () => {
  motionForced = true
  banner.setAttribute('hidden', '')
  renderCatalog()
})

prefersReduced.addEventListener('change', () => {
  if (!shouldAnimate() && !motionForced) {
    banner.removeAttribute('hidden')
    renderCatalog()
  }
})

/* ── Toast ──────────────────────────────────────────────────── */
let toastTimer
function showToast(msg) {
  toastEl.textContent = msg
  toastEl.classList.add('is-visible')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2000)
}

/* ── Clipboard ──────────────────────────────────────────────── */
async function copyText(text, okMsg) {
  try {
    await navigator.clipboard.writeText(text)
    showToast(okMsg)
  } catch {
    showToast('コピーに失敗しました')
  }
}

/* ── CSS extraction (Copy CSS) ──────────────────────────────── */
function extractMotionCSS(classList) {
  const styleRules = []
  const seen = new Set()
  const keyframeNames = new Set()
  const clsRes = classList.trim().split(/\s+/)
    .map(cls => new RegExp(`\\.${cls}(?![\\w-])`))

  for (const sheet of document.styleSheets) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule && clsRes.some(re => re.test(rule.selectorText))) {
        // Drop the .hvr-live twin selectors added for preview auto-play
        const cssText = rule.cssText
          .replace(/,\s*[^,{]*\.hvr-live[^,{]*(?=[,{])/g, '')
        if (!seen.has(cssText)) {
          seen.add(cssText)
          styleRules.push(cssText)
        }
        const names = rule.style.getPropertyValue('animation-name') || ''
        names.split(',').forEach(n => {
          const name = n.trim()
          if (name && name !== 'none') keyframeNames.add(name)
        })
      }
    }
  }

  const keyframeRules = []
  for (const sheet of document.styleSheets) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    for (const rule of rules) {
      if (rule instanceof CSSKeyframesRule && keyframeNames.has(rule.name)) {
        keyframeRules.push(rule.cssText)
      }
    }
  }

  if (!styleRules.length) return null
  return [...styleRules, '', ...keyframeRules].join('\n')
}

/* ── IntersectionObserver: pause off-screen previews ────────── */
let cardObserver
function setupObserver() {
  if (cardObserver) cardObserver.disconnect()
  cardObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.removeAttribute('data-paused')
      } else {
        e.target.setAttribute('data-paused', '')
      }
    }),
    { rootMargin: '120px 0px' }
  )
  document.querySelectorAll('.motion-card').forEach(card => cardObserver.observe(card))
}

/* ── Preview HTML ───────────────────────────────────────────── */
function resolvePreviewType(motion) {
  if (activeTarget === 'All') return motion.preview

  const semanticPreviewTypes = [
    'check', 'xmark', 'dot', 'spinner', 'dots', 'bars', 'skeleton', 'progress',
    'ring', 'wave', 'orbit', 'switch', 'checkbox', 'radio', 'chart-line',
    'chart-bars', 'pie', 'heatmap', 'pin', 'gauge', 'line', 'border',
    'type', 'words', 'ticker', 'cursor', 'trail', 'spotlight', 'gallery',
    'compare', 'marquee', 'slider', 'burst', 'button-submit', 'button-download',
    'input-success', 'input-error', 'autocomplete', 'char-counter', 'morph-loader',
    'liquid-blob', 'scramble', 'breadcrumb', 'choice-expand', 'button-split',
    'stepper', 'stars', 'chips', 'avatars', 'otp', 'search-expand', 'upload',
    'confetti', 'badge', 'bell', 'empty', 'theme-toggle', 'pagedots',
    'toast-queue', 'heart'
  ]
  if (semanticPreviewTypes.includes(motion.preview)) return motion.preview

  const directByTarget = {
    button: ['button', 'button-icon', 'button-label', 'button-loader', 'button-fill', 'button-danger', 'button-split', 'button-segmented', 'button-count', 'choice-expand', 'burst'],
    form: ['input', 'switch', 'checkbox', 'radio'],
    overlay: ['menu', 'radial', 'tooltip', 'modal', 'drawer', 'sheet'],
    navigation: ['tabs', 'link', 'accordion', 'drawer', 'sheet', 'page', 'breadcrumb', 'phone'],
    'card-list': ['card', 'list', 'stagger', 'grid', 'deck'],
    loading: ['spinner', 'dots', 'bars', 'skeleton', 'progress', 'ring', 'wave', 'orbit'],
    text: ['text', 'type', 'words', 'ticker'],
    media: ['photo', 'gallery', 'compare', 'marquee', 'deck'],
    data: ['chart-line', 'chart-bars', 'pie', 'heatmap', 'pin', 'gauge', 'number'],
    gesture: ['phone', 'slider', 'card', 'burst'],
    'cursor-visual': ['cursor', 'trail', 'spotlight', 'panel', 'ring', 'text'],
  }
  if (directByTarget[activeTarget]?.includes(motion.preview)) return motion.preview

  const contextual = {
    button: 'context-button',
    form: 'context-form',
    overlay: 'context-overlay',
    navigation: 'context-nav',
    notification: 'context-toast',
    'card-list': motion.category === 'List' ? 'context-list' : 'context-card',
    loading: 'context-loading',
    text: 'context-text',
    media: 'context-media',
    data: 'context-data',
    gesture: 'context-gesture',
    'cursor-visual': 'context-visual',
  }
  return contextual[activeTarget] || motion.preview
}

function renderThreePreview(motion) {
  return `<div
    class="preview-stage three-stage"
    data-three-key="${motion.key}"
    tabindex="0"
    role="img"
    aria-label="${motion.jpName}のWebGLプレビュー。ドラッグまたは矢印キーで視点を動かせます。"
  >
    <span class="three-stage__loading" aria-hidden="true">WEBGL</span>
    <span class="three-stage__hint" aria-hidden="true">DRAG / ARROW KEYS</span>
  </div>`
}

function renderPreview(motion) {
  if (motion.dimension === '3d') return renderThreePreview(motion)
  if (motion.html) return `<div class="preview-stage">${motion.html}</div>`
  const cls = `preview-motion ${motion.className}`
  switch (resolvePreviewType(motion)) {
    case 'context-button':
      return `<div class="preview-stage"><button class="${cls} preview-context-button" type="button"><span>Action</span></button></div>`
    case 'context-form':
      return `<div class="preview-stage"><div class="${cls} preview-context-form"><label>Email</label><span></span><i></i><b></b></div></div>`
    case 'context-overlay':
      return `<div class="preview-stage"><div class="${cls} preview-context-overlay"><span></span><i></i><i></i></div></div>`
    case 'context-nav':
      return `<div class="preview-stage"><div class="${cls} preview-context-nav"><nav><span></span><span></span><span></span></nav><main><i></i><i></i></main></div></div>`
    case 'context-toast':
      return `<div class="preview-stage"><div class="${cls} preview-context-toast"><span></span><div><i></i><i></i></div></div></div>`
    case 'context-card':
      return `<div class="preview-stage"><div class="${cls} preview-context-card"><span></span><i></i><i></i></div></div>`
    case 'context-list':
      return `<div class="preview-stage"><div class="${cls} preview-context-list"><span></span><span></span><span></span></div></div>`
    case 'context-loading':
      return `<div class="preview-stage"><div class="${cls} preview-context-loading"><span></span><i></i></div></div>`
    case 'context-text':
      return `<div class="preview-stage"><div class="${cls} preview-context-text"><span></span><i></i><i></i></div></div>`
    case 'context-media':
      return `<div class="preview-stage"><div class="${cls} preview-context-media"><span></span><i></i></div></div>`
    case 'context-data':
      return `<div class="preview-stage"><div class="${cls} preview-context-data"><span></span><span></span><span></span><i></i></div></div>`
    case 'context-gesture':
      return `<div class="preview-stage"><div class="${cls} preview-context-gesture"><span></span><i></i><b></b></div></div>`
    case 'context-visual':
      return `<div class="preview-stage"><div class="${cls} preview-context-visual"><span></span><i></i></div></div>`
    case 'photo':
      return `<div class="preview-stage"><div class="${cls} preview-photo"><span></span></div></div>`
    case 'panel':
      return `<div class="preview-stage"><div class="${cls} preview-panel"><span></span><i></i><i></i></div></div>`
    case 'text':
      return `<div class="preview-stage"><div class="${cls} preview-text">Motion</div></div>`
    case 'dots':
      return `<div class="preview-stage"><div class="${cls} preview-dots"><span></span><span></span><span></span></div></div>`
    case 'bars':
      return `<div class="preview-stage"><div class="${cls} preview-bars"><span></span><span></span><span></span><span></span></div></div>`
    case 'skeleton':
      return `<div class="preview-stage"><div class="${cls} preview-skeleton"><span></span><i></i><i></i></div></div>`
    case 'progress':
      return `<div class="preview-stage"><div class="${cls} preview-progress"><span></span></div></div>`
    case 'ring':
      return `<div class="preview-stage"><div class="${cls} preview-ring"></div></div>`
    case 'wave':
      return `<div class="preview-stage"><div class="${cls} preview-wave"><span></span><span></span><span></span><span></span><span></span></div></div>`
    case 'orbit':
      return `<div class="preview-stage"><div class="${cls} preview-orbit"><span></span></div></div>`
    case 'tabs':
      return `<div class="preview-stage"><div class="${cls} preview-tabs"><span></span><span></span><span></span><i></i></div></div>`
    case 'link':
      return `<div class="preview-stage"><div class="${cls} preview-link">Navigation</div></div>`
    case 'accordion':
      return `<div class="preview-stage"><div class="${cls} preview-accordion"><span></span><i></i><i></i></div></div>`
    case 'drawer':
      return `<div class="preview-stage"><div class="${cls} preview-drawer"><span></span></div></div>`
    case 'sheet':
      return `<div class="preview-stage"><div class="${cls} preview-sheet"><span></span></div></div>`
    case 'modal':
      return `<div class="preview-stage"><div class="${cls} preview-modal"><span></span></div></div>`
    case 'crossfade':
      return `<div class="preview-stage"><div class="${cls} preview-crossfade"><span></span><i></i></div></div>`
    case 'page':
      return `<div class="preview-stage"><div class="${cls} preview-page"><span></span><i></i></div></div>`
    case 'breadcrumb':
      return `<div class="preview-stage"><div class="${cls} preview-breadcrumb"><span>Home</span><i></i><span>Library</span><i></i><span>Motion</span></div></div>`
    case 'stagger':
      return `<div class="preview-stage"><div class="${cls} preview-stagger"><span></span><span></span><span></span><span></span></div></div>`
    case 'grid':
      return `<div class="preview-stage"><div class="${cls} preview-grid"><span></span><span></span><span></span><span></span></div></div>`
    case 'list':
      return `<div class="preview-stage"><div class="${cls} preview-list"><span></span><span></span><span></span></div></div>`
    case 'number':
      return `<div class="preview-stage"><div class="${cls} preview-number">128</div></div>`
    case 'card':
      return `<div class="preview-stage"><div class="${cls} preview-card"><span></span><i></i></div></div>`
    case 'phone':
      return `<div class="preview-stage"><div class="${cls} preview-phone"><span></span><i></i></div></div>`
    case 'button':
      return `<div class="preview-stage"><button class="${cls} preview-button" type="button">Action</button></div>`
    case 'button-icon':
      return `<div class="preview-stage"><button class="${cls} preview-button-icon" type="button"><span></span><i></i></button></div>`
    case 'button-label':
      return `<div class="preview-stage"><button class="${cls} preview-button-label" type="button"><span>Continue</span><i>Done</i></button></div>`
    case 'button-loader':
      return `<div class="preview-stage"><button class="${cls} preview-button-loader" type="button"><span></span><i></i></button></div>`
    case 'button-fill':
      return `<div class="preview-stage"><button class="${cls} preview-button-fill" type="button"><span>Save</span></button></div>`
    case 'button-danger':
      return `<div class="preview-stage"><button class="${cls} preview-button-danger" type="button"><span>Delete</span></button></div>`
    case 'button-split':
      return `<div class="preview-stage"><div class="${cls} preview-button-split"><button type="button">Export</button><button type="button"><i></i></button><ul><li>PDF</li><li>CSV</li></ul></div></div>`
    case 'button-segmented':
      return `<div class="preview-stage"><div class="${cls} preview-button-segmented"><i></i><span>Day</span><span>Week</span><span>Month</span></div></div>`
    case 'button-count':
      return `<div class="preview-stage"><button class="${cls} preview-button-count" type="button"><span>Like</span><i>128</i></button></div>`
    case 'button-submit':
      return `<div class="preview-stage"><button class="${cls} preview-button-submit" type="button"><span>Submit</span><i></i></button></div>`
    case 'button-download':
      return `<div class="preview-stage"><button class="${cls} preview-button-download" type="button"><span>Download</span><i></i><b></b></button></div>`
    case 'choice-expand':
      return `<div class="preview-stage"><div class="${cls} preview-choice-expand"><button type="button"><span>Action</span><i></i></button><ul><li>Copy</li><li>Share</li><li>Save</li></ul></div></div>`
    case 'input':
      return `<div class="preview-stage"><div class="${cls} preview-input"><label>Label</label><span></span><i></i></div></div>`
    case 'input-success':
      return `<div class="preview-stage"><div class="${cls} preview-input-status preview-input-status--success"><label>Email</label><span></span><i></i></div></div>`
    case 'input-error':
      return `<div class="preview-stage"><div class="${cls} preview-input-status preview-input-status--error"><label>Email</label><span></span><i></i></div></div>`
    case 'autocomplete':
      return `<div class="preview-stage"><div class="${cls} preview-autocomplete"><div><span></span><i></i></div><ul><li>Tokyo</li><li>Toronto</li><li>Toyama</li></ul></div></div>`
    case 'char-counter':
      return `<div class="preview-stage"><div class="${cls} preview-char-counter"><span></span><i></i><b><em>128</em><em>096</em><em>064</em></b></div></div>`
    case 'switch':
      return `<div class="preview-stage"><div class="${cls} preview-switch"><span></span></div></div>`
    case 'checkbox':
      return `<div class="preview-stage"><div class="${cls} preview-checkbox"><span></span></div></div>`
    case 'radio':
      return `<div class="preview-stage"><div class="${cls} preview-radio"><span></span></div></div>`
    case 'cursor':
      return `<div class="preview-stage"><div class="${cls} preview-cursor"><span></span><i></i></div></div>`
    case 'trail':
      return `<div class="preview-stage"><div class="${cls} preview-trail"><span></span><span></span><span></span><i></i></div></div>`
    case 'menu':
      return `<div class="preview-stage"><div class="${cls} preview-menu"><span></span><i></i><i></i><i></i></div></div>`
    case 'radial':
      return `<div class="preview-stage"><div class="${cls} preview-radial"><span></span><i></i><i></i><i></i><i></i></div></div>`
    case 'tooltip':
      return `<div class="preview-stage"><div class="${cls} preview-tooltip"><span>?</span><i>Hint</i></div></div>`
    case 'gallery':
      return `<div class="preview-stage"><div class="${cls} preview-gallery"><span></span><i></i><i></i><i></i></div></div>`
    case 'compare':
      return `<div class="preview-stage"><div class="${cls} preview-compare"><span></span><i></i></div></div>`
    case 'marquee':
      return `<div class="preview-stage"><div class="${cls} preview-marquee"><span>Motion</span><span>Catalog</span><span>UI</span><span>UX</span></div></div>`
    case 'chart-line':
      return `<div class="preview-stage"><div class="${cls} preview-chart-line"><svg viewBox="0 0 180 86" aria-hidden="true"><path d="M8 72 C36 24, 54 84, 82 45 S128 12, 172 30" /></svg></div></div>`
    case 'chart-bars':
      return `<div class="preview-stage"><div class="${cls} preview-chart-bars"><span></span><span></span><span></span><span></span><span></span></div></div>`
    case 'pie':
      return `<div class="preview-stage"><div class="${cls} preview-pie"></div></div>`
    case 'heatmap':
      return `<div class="preview-stage"><div class="${cls} preview-heatmap">${Array.from({ length: 20 }, () => '<span></span>').join('')}</div></div>`
    case 'pin':
      return `<div class="preview-stage"><div class="${cls} preview-pin"><span></span></div></div>`
    case 'gauge':
      return `<div class="preview-stage"><div class="${cls} preview-gauge"><span></span></div></div>`
    case 'slider':
      return `<div class="preview-stage"><div class="${cls} preview-slider"><span></span></div></div>`
    case 'burst':
      return `<div class="preview-stage"><div class="${cls} preview-burst"><span></span><span></span><span></span><span></span></div></div>`
    case 'line':
      return `<div class="preview-stage"><div class="${cls} preview-line"></div></div>`
    case 'border':
      return `<div class="preview-stage"><div class="${cls} preview-border"></div></div>`
    case 'spotlight':
      if (motion.className === 'cursor-spotlight') {
        return `<div class="preview-stage"><div class="${cls} preview-cursor-spotlight"><span></span><i></i><b></b></div></div>`
      }
      return `<div class="preview-stage"><div class="${cls} preview-spotlight"><span></span><i></i><b></b></div></div>`
    case 'scramble':
      return `<div class="preview-stage"><div class="${cls} preview-scramble"><span>UX-MOTION</span><i>4#-K9Z!R</i></div></div>`
    case 'morph-loader':
      return `<div class="preview-stage"><div class="${cls} preview-morph-loader"><span></span></div></div>`
    case 'liquid-blob':
      return `<div class="preview-stage"><div class="${cls} preview-liquid-blob"><span></span><i></i></div></div>`
    case 'type':
      return `<div class="preview-stage"><div class="${cls} preview-type">Generating...</div></div>`
    case 'words':
      return `<div class="preview-stage"><div class="${cls} preview-words"><span>Smart</span><span>motion</span><span>system</span></div></div>`
    case 'ticker':
      return `<div class="preview-stage"><div class="${cls} preview-ticker"><span>12</span><span>48</span><span>96</span></div></div>`
    case 'scene':
      return `<div class="preview-stage"><div class="${cls} preview-scene"><span></span><i></i></div></div>`
    case 'deck':
      return `<div class="preview-stage"><div class="${cls} preview-deck"><span></span><span></span><span></span></div></div>`
    case 'check':
      return `<div class="preview-stage"><div class="${cls} preview-check"><svg viewBox="0 0 52 52" aria-hidden="true"><circle class="draw-ring" cx="26" cy="26" r="23"/><path class="draw-mark" d="M15 27.5l7.5 7.5L38 19"/></svg></div></div>`
    case 'xmark':
      return `<div class="preview-stage"><div class="${cls} preview-xmark"><svg viewBox="0 0 52 52" aria-hidden="true"><circle class="draw-ring" cx="26" cy="26" r="23"/><path class="draw-mark draw-mark--1" d="M19 19l14 14"/><path class="draw-mark draw-mark--2" d="M33 19L19 33"/></svg></div></div>`
    case 'dot':
      return `<div class="preview-stage"><div class="${cls} preview-dot"></div></div>`
    case 'circle':
      return `<div class="preview-stage"><div class="${cls} preview-circle"></div></div>`
    case 'spinner':
      return `<div class="preview-stage"><div class="${cls} preview-spinner"></div></div>`
    case 'stepper':
      return `<div class="preview-stage"><div class="${cls} preview-stepper"><span>1</span><i></i><span>2</span><i></i><span>3</span></div></div>`
    case 'stars':
      return `<div class="preview-stage"><div class="${cls} preview-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div></div>`
    case 'heart':
      return `<div class="preview-stage"><div class="${cls} preview-heart"><span></span><i></i><i></i><i></i><i></i></div></div>`
    case 'chips':
      return `<div class="preview-stage"><div class="${cls} preview-chips"><span>Design</span><span>Motion</span><span>UI</span></div></div>`
    case 'avatars':
      return `<div class="preview-stage"><div class="${cls} preview-avatars"><span>A</span><span>K</span><span>M</span><span>+3</span></div></div>`
    case 'otp':
      return `<div class="preview-stage"><div class="${cls} preview-otp"><span></span><span></span><span></span><span></span></div></div>`
    case 'search-expand':
      return `<div class="preview-stage"><div class="${cls} preview-search-expand"><i></i><span></span></div></div>`
    case 'upload':
      return `<div class="preview-stage"><div class="${cls} preview-upload"><span></span><i></i><b></b></div></div>`
    case 'confetti':
      return `<div class="preview-stage"><div class="${cls} preview-confetti"><b></b>${Array.from({ length: 10 }, () => '<span></span>').join('')}</div></div>`
    case 'badge':
      return `<div class="preview-stage"><div class="${cls} preview-badge"><span></span><i>3</i></div></div>`
    case 'bell':
      return `<div class="preview-stage"><div class="${cls} preview-bell"><span></span><i></i></div></div>`
    case 'empty':
      return `<div class="preview-stage"><div class="${cls} preview-empty"><span></span><i></i><b></b></div></div>`
    case 'theme-toggle':
      return `<div class="preview-stage"><div class="${cls} preview-theme-toggle"><span></span><i></i></div></div>`
    case 'pagedots':
      return `<div class="preview-stage"><div class="${cls} preview-pagedots"><span></span><span></span><span></span><span></span></div></div>`
    case 'toast-queue':
      return `<div class="preview-stage"><div class="${cls} preview-toast-queue"><span></span><span></span><span></span></div></div>`
    default:
      return `<div class="preview-stage"><div class="${cls} preview-block"></div></div>`
  }
}

/* ── Filters ────────────────────────────────────────────────── */
function matchesCategory(motion, category = activeCategory) {
  return category === 'All' || motion.category === category
}

function matchesTarget(motion, target = activeTarget) {
  return target === 'All' || motion.targets.includes(target)
}

function matchesSearch(motion, query) {
  if (!query) return true
  return query.split(/\s+/).every(term => motion.haystack.includes(term))
}

function currentQuery() {
  return searchInput.value.trim().toLowerCase()
}

function targetLabel(id) {
  const hit = activeTargets().find(item => item.id === id)
  return hit ? hit.short : id
}

function createTargetFilters() {
  const query = currentQuery()
  const catalog = activeMotions()
  const allTargets = [{ id: 'All', label: 'すべて', short: 'All' }, ...activeTargets()]
  targetEl.innerHTML = allTargets.map(item => {
    const count = catalog.filter(m =>
      matchesTarget(m, item.id) && matchesCategory(m) && matchesSearch(m, query)
    ).length
    const isActive = item.id === activeTarget
    return `<button
      class="chip chip--target"
      data-target="${item.id}"
      type="button"
      aria-pressed="${isActive}"
      title="${item.short}"
    >${item.label}<span class="chip__count">${count}</span></button>`
  }).join('')
}

function createCategoryFilters() {
  const query = currentQuery()
  const catalog = activeMotions()
  const allCategories = ['All', ...activeCategories()]
  filtersEl.innerHTML = allCategories.map(cat => {
    const count = catalog.filter(m =>
      matchesCategory(m, cat) && matchesTarget(m) && matchesSearch(m, query)
    ).length
    if (cat !== 'All' && count === 0) return ''
    const isActive = cat === activeCategory
    return `<button
      class="chip chip--category"
      data-category="${cat}"
      type="button"
      aria-pressed="${isActive}"
    >${cat === 'All' ? 'すべて' : cat}<span class="chip__count">${count}</span></button>`
  }).join('')
}

/* ── URL state ──────────────────────────────────────────────── */
function readStateFromURL() {
  const params = new URLSearchParams(location.search)
  const dimension = params.get('dimension')
  const q = params.get('q')
  const target = params.get('target')
  const cat = params.get('cat')
  if (dimension === '3d') activeDimension = '3d'
  if (q) searchInput.value = q
  if (target && activeTargets().some(t => t.id === target)) activeTarget = target
  if (cat && activeCategories().includes(cat)) activeCategory = cat
}

function writeStateToURL() {
  const params = new URLSearchParams()
  if (activeDimension === '3d') params.set('dimension', '3d')
  const q = searchInput.value.trim()
  if (q) params.set('q', q)
  if (activeTarget !== 'All') params.set('target', activeTarget)
  if (activeCategory !== 'All') params.set('cat', activeCategory)
  const qs = params.toString()
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname)
}

/* ── Playback speed ─────────────────────────────────────────── */
const SPEED_STEPS = [1, 0.5, 2]

function applySpeed() {
  document.getAnimations().forEach(anim => { anim.playbackRate = speedRate })
  window.dispatchEvent(new CustomEvent('motioncatalog:speed', { detail: { speed: speedRate } }))
}

speedBtn.addEventListener('click', () => {
  const next = SPEED_STEPS[(SPEED_STEPS.indexOf(speedRate) + 1) % SPEED_STEPS.length]
  speedRate = next
  speedBtn.textContent = `${String(next).replace('0.5', '.5')}×`
  speedBtn.setAttribute('aria-label', `再生速度 ${next}倍`)
  applySpeed()
})

/* ── Spec line: read real duration / easing from the animation ─ */
function fillSpecs() {
  document.querySelectorAll('.motion-card').forEach(card => {
    const specEl = card.querySelector('.card-spec')
    const stage = card.querySelector('.preview-stage')
    if (!specEl || !stage) return
    if (specEl.dataset.fixedSpec === 'true') return
    const anims = stage.getAnimations({ subtree: true })
    if (!anims.length) {
      specEl.textContent = stage.querySelector('[class*="hvr-"]') ? ':hover / :focus' : ''
      return
    }
    let longest = anims[0]
    for (const a of anims) {
      const d = a.effect?.getTiming().duration || 0
      if (d > (longest.effect?.getTiming().duration || 0)) longest = a
    }
    const t = longest.effect.getTiming()
    const dur = typeof t.duration === 'number' ? `${(t.duration / 1000).toFixed(t.duration % 1000 === 0 ? 0 : 1)}s` : ''
    const iter = t.iterations === Infinity ? '∞' : `×${t.iterations}`
    let ease = ''
    const target = longest.effect.target
    if (target) {
      const style = getComputedStyle(target)
      const names = style.animationName.split(', ')
      const easings = style.animationTimingFunction.split(/,(?![^(]*\))/).map(s => s.trim())
      const i = names.indexOf(longest.animationName)
      ease = easings[i >= 0 && i < easings.length ? i : 0] || ''
      ease = ease.replace(/^cubic-bezier\(([^)]*)\)$/, (m, args) =>
        `cubic(${args.split(',').map(n => String(Number(Number(n).toFixed(2)))).join(',')})`)
    }
    specEl.textContent = [dur, ease, iter].filter(Boolean).join(' · ')
  })
}

/* ── Render Catalog ─────────────────────────────────────────── */
function renderCatalog() {
  const query = currentQuery()
  const catalog = activeMotions()
  const filtered = catalog.filter(motion =>
    matchesTarget(motion) && matchesCategory(motion) && matchesSearch(motion, query)
  )

  resultCount.innerHTML = `<strong>${filtered.length}</strong> / ${catalog.length}`

  if (!filtered.length) {
    grid.innerHTML = ''
    emptyState.removeAttribute('hidden')
    afterAnimationsStart()
    return
  }
  emptyState.setAttribute('hidden', '')

  grid.innerHTML = filtered.map((motion, index) => {
    const delay = Math.min(index * 14, 220)
    const isThree = motion.dimension === '3d'
    const preview = isThree || shouldAnimate()
      ? renderPreview(motion)
      : `<div class="preview-stage preview-stage--paused" aria-label="モーションプレビュー停止中"></div>`
    return `<article
      class="motion-card${isThree ? ' motion-card--3d' : ''}"
      style="--card-delay: ${delay}ms"
      data-id="${motion.id}"
      data-key="${motion.key || ''}"
      data-dimension="${isThree ? '3d' : '2d'}"
      data-category="${motion.category}"
    >
      <header class="card-top">
        <span class="card-num">${String(motion.id).padStart(3, '0')}</span>
        <span class="card-cat">${motion.category}</span>
        ${motion.source
          ? `<span class="card-source">${motion.source}</span>`
          : targetLabel(motion.targets[0]).toLowerCase() !== motion.category.toLowerCase()
            ? `<span class="card-target">${targetLabel(motion.targets[0])}</span>`
            : ''}
        <button class="card-replay" type="button" data-replay aria-label="このモーションを再生し直す" title="Replay">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7a5 5 0 1 0 1-3.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M2 2.5v3h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </header>
      ${preview}
      <div class="card-body">
        <h2 class="card-title">
          <span class="card-name-en">${motion.name}</span>
          <span class="card-name-jp">${motion.jpName}</span>
        </h2>
        <p class="card-use">${motion.useFor}</p>
        <button
          class="request-text"
          type="button"
          data-request="${motion.request.replace(/"/g, '&quot;')}"
          title="クリックで指示文をコピー"
        ><span class="request-text__label">指示文</span>${motion.request}</button>
      </div>
      <footer class="card-foot">
        <code
          class="card-spec"
          title="${isThree ? 'duration / easing / iterations' : '実測 duration / easing / iterations'}"
          ${isThree ? 'data-fixed-spec="true"' : ''}
        >${isThree ? motion.spec : ''}</code>
        <button
          class="copy-css"
          type="button"
          ${isThree ? `data-three-key="${motion.key}"` : `data-css="${motion.copyClasses || motion.className}"`}
          title="${isThree ? 'Three.jsコードをコピー' : 'このモーションのCSSをコピー'}"
        >
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M9.5 4.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" stroke="currentColor" stroke-width="1.4"/>
          </svg>
          ${isThree ? 'THREE.JS' : `.${motion.className}`}
        </button>
      </footer>
    </article>`
  }).join('')

  if (shouldAnimate()) {
    setupObserver()
    afterAnimationsStart()
  }
}

/* getAnimations() flushes style, so freshly inserted previews are
   already readable (specs) and retimable (speed) synchronously. */
function afterAnimationsStart() {
  if (speedRate !== 1) applySpeed()
  fillSpecs()
  window.dispatchEvent(new CustomEvent('motioncatalog:render', {
    detail: {
      dimension: activeDimension,
      animate: shouldAnimate(),
      speed: speedRate,
    },
  }))
}

function refresh() {
  createTargetFilters()
  createCategoryFilters()
  renderCatalog()
  writeStateToURL()
}

/* ── Grid interactions (event delegation) ───────────────────── */
grid.addEventListener('click', e => {
  const requestBtn = e.target.closest('.request-text')
  if (requestBtn) {
    copyText(requestBtn.dataset.request, '指示文をコピーしました ✓')
    return
  }
  const cssBtn = e.target.closest('.copy-css')
  if (cssBtn) {
    if (cssBtn.dataset.threeKey) {
      const motion = threeMotions.find(item => item.key === cssBtn.dataset.threeKey)
      if (motion) copyText(motion.code, 'Three.jsコードをコピーしました ✓')
      else showToast('コードを見つけられませんでした')
      return
    }
    const css = extractMotionCSS(cssBtn.dataset.css)
    if (css) copyText(css, 'CSSをコピーしました ✓')
    else showToast('CSSを抽出できませんでした')
    return
  }
  const replayBtn = e.target.closest('[data-replay]')
  if (replayBtn) {
    const card = replayBtn.closest('.motion-card')
    if (card.dataset.dimension === '3d') {
      window.dispatchEvent(new CustomEvent('motioncatalog:replay', {
        detail: { key: card.dataset.key },
      }))
      return
    }
    const motion = motions.find(m => m.id === Number(card.dataset.id))
    const stage = card.querySelector('.preview-stage')
    if (motion && stage && shouldAnimate()) {
      const wrap = document.createElement('div')
      wrap.innerHTML = renderPreview(motion)
      stage.replaceWith(wrap.firstElementChild)
      afterAnimationsStart()
    }
  }
})

/* ── Search ─────────────────────────────────────────────────── */
let searchTimer
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer)
  searchClear.hidden = !searchInput.value
  searchTimer = setTimeout(refresh, SEARCH_DEBOUNCE)
})

searchClear.addEventListener('click', () => {
  searchInput.value = ''
  searchClear.hidden = true
  searchInput.focus()
  refresh()
})

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    searchInput.value = ''
    searchClear.hidden = true
    refresh()
    searchInput.blur()
  }
})

document.addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')
  if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
    e.preventDefault()
    searchInput.focus()
    searchInput.select()
  }
})

/* ── Filter clicks ──────────────────────────────────────────── */
targetEl.addEventListener('click', e => {
  const btn = e.target.closest('button[data-target]')
  if (!btn) return
  activeTarget = btn.dataset.target
  refresh()
})

filtersEl.addEventListener('click', e => {
  const btn = e.target.closest('button[data-category]')
  if (!btn) return
  activeCategory = btn.dataset.category
  refresh()
})

/* ── Reset / Replay ─────────────────────────────────────────── */
resetBtn.addEventListener('click', () => {
  activeTarget = 'All'
  activeCategory = 'All'
  searchInput.value = ''
  searchClear.hidden = true
  refresh()
})

replayAllBtn.addEventListener('click', () => {
  renderCatalog()
})

/* ── Hover.css preview auto-play ────────────────────────────── */
setInterval(() => {
  if (!shouldAnimate() || document.hidden) return
  document.querySelectorAll('.motion-card:not([data-paused]) .preview-motion[class*="hvr-"]')
    .forEach(el => el.classList.toggle('hvr-live'))
}, 1400)

/* ── Init ───────────────────────────────────────────────────── */
readStateFromURL()
syncDimensionUI()
searchClear.hidden = !searchInput.value
refresh()
