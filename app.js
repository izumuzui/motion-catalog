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
  'Input','Cursor','Menu','Media','Data','Visual',
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
].map(([name, jpName, category, useFor, request, className, preview], index) =>
  ({ id: index + 1, name, jpName, category, useFor, request, className, preview })
)

function motionText(motion) {
  return `${motion.name} ${motion.jpName} ${motion.category} ${motion.useFor} ${motion.request} ${motion.className}`.toLowerCase()
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

motions.forEach(motion => {
  motion.targets = deriveTargets(motion)
  motion.haystack = `${motionText(motion)} ${motion.targets
    .map(id => {
      const hit = targets.find(item => item.id === id)
      return hit ? `${hit.label} ${hit.short}` : ''
    })
    .join(' ')}`.toLowerCase()
})

/* ── State ──────────────────────────────────────────────────── */
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
function extractMotionCSS(className) {
  const styleRules = []
  const keyframeNames = new Set()
  const clsRe = new RegExp(`\\.${className}(?![\\w-])`)

  for (const sheet of document.styleSheets) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule && clsRe.test(rule.selectorText)) {
        styleRules.push(rule.cssText)
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

function renderPreview(motion) {
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
      return `<div class="preview-stage"><div class="${cls} preview-check"><span></span></div></div>`
    case 'xmark':
      return `<div class="preview-stage"><div class="${cls} preview-xmark"><span></span><i></i></div></div>`
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
  const hit = targets.find(item => item.id === id)
  return hit ? hit.short : id
}

function createTargetFilters() {
  const query = currentQuery()
  const allTargets = [{ id: 'All', label: 'すべて', short: 'All' }, ...targets]
  targetEl.innerHTML = allTargets.map(item => {
    const count = motions.filter(m =>
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
  const allCategories = ['All', ...categories]
  filtersEl.innerHTML = allCategories.map(cat => {
    const count = motions.filter(m =>
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
  const q = params.get('q')
  const target = params.get('target')
  const cat = params.get('cat')
  if (q) searchInput.value = q
  if (target && targets.some(t => t.id === target)) activeTarget = target
  if (cat && categories.includes(cat)) activeCategory = cat
}

function writeStateToURL() {
  const params = new URLSearchParams()
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
    const anims = stage.getAnimations({ subtree: true })
    if (!anims.length) { specEl.textContent = '' ; return }
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
  const filtered = motions.filter(motion =>
    matchesTarget(motion) && matchesCategory(motion) && matchesSearch(motion, query)
  )

  resultCount.innerHTML = `<strong>${filtered.length}</strong> / ${motions.length}`

  if (!filtered.length) {
    grid.innerHTML = ''
    emptyState.removeAttribute('hidden')
    return
  }
  emptyState.setAttribute('hidden', '')

  grid.innerHTML = filtered.map((motion, index) => {
    const delay = Math.min(index * 14, 220)
    const preview = shouldAnimate()
      ? renderPreview(motion)
      : `<div class="preview-stage preview-stage--paused" aria-label="モーションプレビュー停止中"></div>`
    return `<article class="motion-card" style="--card-delay: ${delay}ms" data-id="${motion.id}" data-category="${motion.category}">
      <header class="card-top">
        <span class="card-num">${String(motion.id).padStart(3, '0')}</span>
        <span class="card-cat">${motion.category}</span>
        <span class="card-target">${targetLabel(motion.targets[0])}</span>
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
        <code class="card-spec" title="実測 duration / easing / iterations"></code>
        <button class="copy-css" type="button" data-css="${motion.className}" title="このモーションのCSSをコピー">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M9.5 4.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" stroke="currentColor" stroke-width="1.4"/>
          </svg>
          .${motion.className}
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
    const css = extractMotionCSS(cssBtn.dataset.css)
    if (css) copyText(css, 'CSSをコピーしました ✓')
    else showToast('CSSを抽出できませんでした')
    return
  }
  const replayBtn = e.target.closest('[data-replay]')
  if (replayBtn) {
    const card = replayBtn.closest('.motion-card')
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

/* ── Init ───────────────────────────────────────────────────── */
readStateFromURL()
searchClear.hidden = !searchInput.value
refresh()
