export function getErrorMessage(err: any): string {
  if (typeof err === 'string') {
    return err;
  }

  const detail = err?.response?.data?.detail;
  
  if (!detail) {
    return err?.message || 'エラーが発生しました';
  }

  // detailが文字列の場合
  if (typeof detail === 'string') {
    return detail;
  }

  // detailが配列の場合（バリデーションエラー）
  if (Array.isArray(detail)) {
    return detail.map((item: any) => {
      if (typeof item === 'string') return item;
      if (item.msg) return item.msg;
      return JSON.stringify(item);
    }).join(', ');
  }

  // detailがオブジェクトの場合
  if (typeof detail === 'object') {
    if (detail.msg) return detail.msg;
    return JSON.stringify(detail);
  }

  return 'エラーが発生しました';
}
