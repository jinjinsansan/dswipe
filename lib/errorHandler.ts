const DEFAULT_ERROR_MESSAGE = 'エラーが発生しました';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const safeGet = (source: unknown, key: string): unknown =>
  isRecord(source) ? source[key] : undefined;

const stringifyFallback = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return DEFAULT_ERROR_MESSAGE;
  }
};

export function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }

  const detail = safeGet(safeGet(safeGet(err, 'response'), 'data'), 'detail');

  if (detail === undefined || detail === null) {
    const message = safeGet(err, 'message');
    return typeof message === 'string' && message.trim().length > 0
      ? message
      : DEFAULT_ERROR_MESSAGE;
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        const msg = safeGet(item, 'msg');
        if (typeof msg === 'string') {
          return msg;
        }
        return stringifyFallback(item);
      })
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

    return messages.length > 0 ? messages.join(', ') : DEFAULT_ERROR_MESSAGE;
  }

  if (isRecord(detail)) {
    const msg = safeGet(detail, 'msg');
    if (typeof msg === 'string') {
      return msg;
    }
    return stringifyFallback(detail);
  }

  return DEFAULT_ERROR_MESSAGE;
}
