import { DEFAULT_LOCALE, Locale } from './locales';

export interface NoteListMessages {
  pageTitle: string;
  pageSubtitle: string;
  filters: {
    all: string;
    free: string;
    paid: string;
  };
  searchPlaceholder: string;
  allCategoriesLabel: string;
  featuredBadge: string;
  loading: string;
  loadError: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyBadge: string;
  unpublishedLabel: string;
  paidBadge: string;
  freeBadge: string;
}

export interface NoteDetailMessages {
  unpublishedLabel: string;
  fetchError: string;
  pointsNotAvailable: string;
  yenNotAvailable: string;
  confirmPointsPurchase: (payload: { title: string; pricePoints: number }) => string;
  confirmYenPurchase: (payload: { title: string; priceYen: number }) => string;
  pointsPurchaseSuccess: (payload: { remainingPoints: number }) => string;
  redirectingToCheckout: string;
  checkoutUrlError: string;
  genericPurchaseError: string;
  initializing: string;
  loading: string;
  notFound: string;
  loginToPurchase: string;
  publishedAtLabel: string;
  priceLabel: string;
  priceNotConfigured: string;
  freeLabel: string;
  authorLabel: string;
  youAreAuthor: string;
  paidContentTitle: string;
  paidContentDescription: string;
  pointsPaymentTitle: string;
  pointsPaymentNote: string;
  yenPaymentTitle: string;
  yenPaymentNote: string;
  noPaymentMethods: string;
  processing: string;
  purchaseDisclaimer: string;
  loginPrompt: string;
  shareHeading: string;
  shareOnX: string;
  shareOnLine: string;
  accessGrantedMessage: string;
  backToNotes: string;
  editNote: string;
}

export interface ShareUnlockMessages {
  loading: string;
  alreadySharedTitle: string;
  alreadySharedLink: string;
  shareTitle: string;
  shareDescription: (payload: { username?: string | null; pricePoints: number }) => string;
  shareHintPrimary: string;
  shareHintSecondary: string;
  viewOfficialPost: (payload: { url: string }) => string;
  unavailableNotice: string;
  processing: string;
  primaryButton: string;
  connectHint: string;
  errorTitle: string;
  genericError: string;
  requiresXLink: string;
  alreadySharedError: string;
  unavailableError: string;
  navigateToSettings: string;
}

export interface PurchaseSuccessMessages {
  heading: string;
  description: string;
  statusLabel: string;
  status: {
    completed: string;
    pending: string;
    cancelled: string;
    rejected: string;
    expired: string;
    unknown: string;
  };
  transactionIdLabel: string;
  checkingStatus: string;
  notificationSent: string;
  notificationPending: string;
  statusError: string;
  autoRedirect: (payload: { seconds: number }) => string;
  manualRedirect: string;
  goToArticle: string;
  goToDashboard: string;
}

const noteListMessages: Record<Locale, NoteListMessages> = {
  ja: {
    pageTitle: 'Swipeコラム一覧',
    pageSubtitle: '情報発信者が投稿したSwipeコラムをここで発見できます',
    filters: {
      all: 'すべて',
      free: '無料記事',
      paid: '有料記事',
    },
    searchPlaceholder: '記事タイトル・概要で検索',
    allCategoriesLabel: '全カテゴリー',
    featuredBadge: '人気',
    loading: '読み込み中...',
    loadError: '記事一覧の取得に失敗しました',
    emptyTitle: '記事が見つかりませんでした',
    emptyDescription: '条件を変更するか、キーワードを変えて再検索してください。無料記事と有料記事を切り替えることもできます。',
    emptyBadge: '新しいSwipeコラムは順次追加予定です',
    unpublishedLabel: '未公開',
    paidBadge: '有料',
    freeBadge: 'FREE',
  },
  en: {
    pageTitle: 'Swipe Columns',
    pageSubtitle: 'Discover premium and free Swipe Columns from top creators.',
    filters: {
      all: 'All',
      free: 'Free',
      paid: 'Paid',
    },
    searchPlaceholder: 'Search by title or description',
    allCategoriesLabel: 'All categories',
    featuredBadge: 'Hot',
    loading: 'Loading...',
    loadError: 'Failed to load Swipe Column listings.',
    emptyTitle: 'No Swipe Columns found',
    emptyDescription: 'Try adjusting the filters or using a different keyword. You can also toggle between free and paid Swipe Columns.',
    emptyBadge: 'New Swipe Columns are coming soon',
    unpublishedLabel: 'Draft',
    paidBadge: 'PAID',
    freeBadge: 'FREE',
  },
};

const noteDetailMessages: Record<Locale, NoteDetailMessages> = {
  ja: {
    unpublishedLabel: '非公開',
    fetchError: 'Swipeコラムの取得に失敗しました',
    pointsNotAvailable: 'このSwipeコラムはポイント決済に対応していません',
    yenNotAvailable: 'このSwipeコラムは日本円決済に対応していません',
    confirmPointsPurchase: ({ title, pricePoints }) =>
      `以下のSwipeコラムを購入しますか？\n\nタイトル: ${title}\n価格: ${pricePoints.toLocaleString()} ポイント\n\nポイントが消費されます。よろしいですか？`,
    confirmYenPurchase: ({ title, priceYen }) =>
      `以下のSwipeコラムを日本円決済で購入しますか？\n\nタイトル: ${title}\n価格: ${priceYen.toLocaleString()} 円\n\n決済ページ(one.lat)に遷移します。よろしいですか？`,
    pointsPurchaseSuccess: ({ remainingPoints }) =>
      `購入が完了しました。残りポイント: ${remainingPoints.toLocaleString()} pt`,
    redirectingToCheckout: '決済ページに遷移します。完了後に再読み込みしてください。',
    checkoutUrlError: '決済URLの取得に失敗しました',
    genericPurchaseError: '購入に失敗しました。もう一度お試しください。',
    initializing: '初期化中...',
    loading: '読み込み中...',
    notFound: 'Swipeコラムが見つかりませんでした',
    loginToPurchase: 'ログインして購入',
    publishedAtLabel: '公開日:',
    priceLabel: '価格:',
    priceNotConfigured: '販売設定未設定',
    freeLabel: '無料',
    authorLabel: '著者:',
    youAreAuthor: 'あなたの記事です',
    paidContentTitle: 'この続きは有料コンテンツです',
    paidContentDescription: '購入すると残りのコンテンツがすべて解放されます。',
    pointsPaymentTitle: 'ポイント決済',
    pointsPaymentNote: '保有ポイントから差し引かれます',
    yenPaymentTitle: '日本円決済',
    yenPaymentNote: 'one.lat決済ページに移動します',
    noPaymentMethods: '現在購入できる決済方法が設定されていません。',
    processing: '処理中...',
    purchaseDisclaimer: 'デジタルコンテンツの性質上、購入完了後のポイントおよび提供済みコンテンツはキャンセルできません。',
    loginPrompt: 'アカウントをお持ちでない場合はこちらからログイン/登録',
    shareHeading: 'SNSでシェア',
    shareOnX: 'Xでシェア',
    shareOnLine: 'LINEでシェア',
    accessGrantedMessage: '現在あなたは有料エリアを閲覧中です。',
    backToNotes: '← Swipeコラム一覧へ戻る',
    editNote: 'Swipeコラム編集',
  },
  en: {
    unpublishedLabel: 'Unpublished',
    fetchError: 'Failed to load this Swipe Column.',
    pointsNotAvailable: 'This Swipe Column is not available for point purchases.',
    yenNotAvailable: 'This Swipe Column does not support JPY payments.',
    confirmPointsPurchase: ({ title, pricePoints }) =>
      `Do you want to unlock this Swipe Column with points?\n\nTitle: ${title}\nPrice: ${pricePoints.toLocaleString()} pts\n\nYour balance will be reduced. Continue?`,
    confirmYenPurchase: ({ title, priceYen }) =>
      `Do you want to purchase this Swipe Column in JPY?\n\nTitle: ${title}\nPrice: ¥${priceYen.toLocaleString()}\n\nYou will be redirected to the one.lat checkout page. Continue?`,
    pointsPurchaseSuccess: ({ remainingPoints }) =>
      `Purchase completed. Remaining balance: ${remainingPoints.toLocaleString()} pts`,
    redirectingToCheckout: 'Redirecting to the checkout page. Please refresh after completing payment.',
    checkoutUrlError: 'Failed to retrieve the checkout URL.',
    genericPurchaseError: 'Purchase failed. Please try again.',
    initializing: 'Initializing...',
    loading: 'Loading...',
    notFound: 'Swipe Column not found',
    loginToPurchase: 'Sign in to purchase',
    publishedAtLabel: 'Published:',
    priceLabel: 'Price:',
    priceNotConfigured: 'Payment not configured',
    freeLabel: 'Free',
    authorLabel: 'Author:',
    youAreAuthor: 'This is your Swipe Column',
    paidContentTitle: 'Premium content ahead',
    paidContentDescription: 'Unlock the remainder of this Swipe Column to continue reading.',
    pointsPaymentTitle: 'Pay with points',
    pointsPaymentNote: 'Points will be deducted from your balance.',
    yenPaymentTitle: 'Pay in JPY',
    yenPaymentNote: 'You will be redirected to the one.lat checkout page.',
    noPaymentMethods: 'No payment methods are currently available.',
    processing: 'Processing...',
    purchaseDisclaimer: 'Digital purchases are final. Points and delivered content cannot be refunded.',
    loginPrompt: 'Need an account? Sign in or register first.',
    shareHeading: 'Share on social media',
    shareOnX: 'Share on X',
    shareOnLine: 'Share on LINE',
    accessGrantedMessage: 'You currently have access to the premium section.',
    backToNotes: '← Back to Swipe Columns',
    editNote: 'Edit Swipe Column',
  },
};

const shareUnlockMessages: Record<Locale, ShareUnlockMessages> = {
  ja: {
    loading: '確認中...',
    alreadySharedTitle: 'リツイート済み - 記事が解放されました！',
    alreadySharedLink: 'リツイートを表示 →',
    shareTitle: 'Xでリツイートして無料で読む',
    shareDescription: ({ username, pricePoints }) =>
      `@${username ?? '公式アカウント'} の公式ポストをリツイートすると、${pricePoints.toLocaleString()}P の支払いなしで全文を読むことができます。`,
    shareHintPrimary: 'ボタンを押すと連携済みのXアカウントで自動的にリツイートします。',
    shareHintSecondary: 'ログインとX連携が必要です。',
    viewOfficialPost: ({ url }) => `公式ポストを確認する → ${url}`,
    unavailableNotice: '販売者が公式ポストを設定するまでリツイート解放は利用できません。',
    processing: 'リツイート処理中...',
    primaryButton: 'Xでリツイートして無料で読む',
    connectHint: 'アカウントを連携すると、リツイート解放が利用できます。',
    errorTitle: 'エラー',
    genericError: 'リツイート処理中にエラーが発生しました。もう一度お試しください。',
    requiresXLink: 'X連携が必要です。設定画面で連携してください。',
    alreadySharedError: '既にこのSwipeコラムをリツイート済みです。',
    unavailableError: '販売者が公式ポストを設定していないため、現在リツイート解放は利用できません。',
    navigateToSettings: '設定画面でX連携する →',
  },
  en: {
    loading: 'Checking...',
    alreadySharedTitle: 'Retweet confirmed – premium content unlocked!',
    alreadySharedLink: 'View your retweet →',
    shareTitle: 'Retweet on X to read for free',
    shareDescription: ({ username, pricePoints }) =>
      `Retweet the official post from @${username ?? 'official'} to read the full Swipe Column without paying ${pricePoints.toLocaleString()} pts.`,
    shareHintPrimary: 'Tap the button to retweet automatically with your linked X account.',
    shareHintSecondary: 'A logged-in account linked with X is required.',
    viewOfficialPost: ({ url }) => `Open the official post → ${url}`,
    unavailableNotice: 'Share-to-unlock will be available once the seller registers an official post.',
    processing: 'Processing retweet...',
    primaryButton: 'Retweet on X to unlock',
    connectHint: 'Link your account to unlock Swipe Columns by retweeting.',
    errorTitle: 'Error',
    genericError: 'An error occurred while processing the retweet. Please try again.',
    requiresXLink: 'Please connect your X account from the settings page.',
    alreadySharedError: 'You have already retweeted this Swipe Column.',
    unavailableError: 'Share unlock is not available because the seller has not set an official post.',
    navigateToSettings: 'Open X linking settings →',
  },
};

const purchaseSuccessMessages: Record<Locale, PurchaseSuccessMessages> = {
  ja: {
    heading: '決済が完了しました！',
    description: 'Swipeコラムの購入が正常に完了しました。すぐに記事へ移動して内容をご確認ください。',
    statusLabel: '決済ステータス',
    status: {
      completed: '完了',
      pending: '確認中',
      cancelled: 'キャンセル',
      rejected: '拒否',
      expired: '期限切れ',
      unknown: '確認中',
    },
    transactionIdLabel: 'トランザクションID',
    checkingStatus: '決済状況を確認しています…',
    notificationSent: '運営からのお知らせにテンプレートメッセージを送信しました。',
    notificationPending: '運営からのお知らせへの反映には数秒かかる場合があります。',
    statusError: '決済状態の確認に失敗しました。数秒後に再試行します。',
    autoRedirect: ({ seconds }) => `${seconds}秒後に自動で記事ページに戻ります...`,
    manualRedirect: '記事ページに戻るリンクからお進みください。',
    goToArticle: '記事ページへ移動する',
    goToDashboard: 'ダッシュボードに戻る',
  },
  en: {
    heading: 'Payment completed!',
    description: 'Your purchase was successful. You can now access the full Swipe Column immediately.',
    statusLabel: 'Payment status',
    status: {
      completed: 'Completed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      rejected: 'Rejected',
      expired: 'Expired',
      unknown: 'Pending',
    },
    transactionIdLabel: 'Transaction ID',
    checkingStatus: 'Checking payment status…',
    notificationSent: 'We sent a confirmation message to your inbox.',
    notificationPending: 'It may take a few seconds for the notification to appear.',
    statusError: 'Failed to refresh payment status. We will retry in a moment.',
    autoRedirect: ({ seconds }) => `You will be redirected to the Swipe Column in ${seconds} seconds…`,
    goToArticle: 'Open the Swipe Column',
    goToArticle: 'Open the note',
    goToDashboard: 'Back to dashboard',
  },
};

export function getNoteListMessages(locale: Locale = DEFAULT_LOCALE): NoteListMessages {
  return noteListMessages[locale] ?? noteListMessages[DEFAULT_LOCALE];
}

export function getNoteDetailMessages(locale: Locale = DEFAULT_LOCALE): NoteDetailMessages {
  return noteDetailMessages[locale] ?? noteDetailMessages[DEFAULT_LOCALE];
}

export function getShareUnlockMessages(locale: Locale = DEFAULT_LOCALE): ShareUnlockMessages {
  return shareUnlockMessages[locale] ?? shareUnlockMessages[DEFAULT_LOCALE];
}

export function getPurchaseSuccessMessages(locale: Locale = DEFAULT_LOCALE): PurchaseSuccessMessages {
  return purchaseSuccessMessages[locale] ?? purchaseSuccessMessages[DEFAULT_LOCALE];
}
