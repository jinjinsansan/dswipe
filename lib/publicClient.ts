const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

const isBrowser = typeof window !== 'undefined';

type Primitive = string | number | boolean | null | undefined;
type QueryValue = Primitive | Primitive[];

type RequestConfig = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, QueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
};

const buildQueryString = (params?: Record<string, QueryValue>): string => {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) {
          return;
        }
        searchParams.append(key, String(item));
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const createHeaders = (input?: HeadersInit): Headers => {
  if (input instanceof Headers) {
    return new Headers(input);
  }

  if (Array.isArray(input)) {
    return new Headers(input);
  }

  return new Headers(input ?? {});
};

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = 'GET', params, body, headers, auth = false } = config;

  const query = buildQueryString(params);
  const url = `${API_BASE}${path}${query}`;

  const requestHeaders = createHeaders(headers);

  const init: RequestInit = {
    method,
    credentials: auth ? 'include' : 'omit',
    headers: requestHeaders,
  };

  if (auth && isBrowser) {
    const token = localStorage.getItem('access_token');
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  if (body !== undefined && body !== null) {
    if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
      init.body = body as BodyInit;
    } else if (typeof body === 'string') {
      init.body = body;
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
    } else {
      init.body = JSON.stringify(body);
      requestHeaders.set('Content-Type', 'application/json');
    }
  }

  if (requestHeaders.keys().next().done) {
    delete init.headers;
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    let errorPayload: unknown = null;

    try {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        errorPayload = await response.json();
      } else {
        errorPayload = await response.text();
      }
    } catch {
      errorPayload = null;
    }

    const error = new Error(
      typeof errorPayload === 'string' && errorPayload.trim()
        ? errorPayload
        : `Request failed with status ${response.status}`
    );

    throw Object.assign(error, {
      status: response.status,
      payload: errorPayload,
      url,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export const fetchLandingPage = async (
  slug: string,
  options?: { trackView?: boolean; sessionId?: string }
): Promise<any> => {
  return request(`/public/${encodeURIComponent(slug)}`, {
    params: {
      track_view: options?.trackView ? 'true' : undefined,
      session_id: options?.sessionId,
    },
  });
};

export const fetchLandingPageByShareToken = async (
  token: string,
  options?: { trackView?: boolean; sessionId?: string }
): Promise<any> => {
  return request(`/public/share/${encodeURIComponent(token)}`, {
    params: {
      track_view: options?.trackView ? 'true' : undefined,
      session_id: options?.sessionId,
    },
  });
};

export const fetchRequiredActions = async (slug: string, sessionId?: string): Promise<any> => {
  return request(`/public/${encodeURIComponent(slug)}/required-actions`, {
    params: sessionId ? { session_id: sessionId } : undefined,
  });
};

export const recordStepView = async (
  slug: string,
  data: { stepId: string; sessionId?: string }
): Promise<void> => {
  await request(`/public/${encodeURIComponent(slug)}/step-view`, {
    method: 'POST',
    body: {
      step_id: data.stepId,
      session_id: data.sessionId,
    },
  });
};

export const recordStepExit = async (
  slug: string,
  data: { stepId: string; sessionId?: string }
): Promise<void> => {
  await request(`/public/${encodeURIComponent(slug)}/step-exit`, {
    method: 'POST',
    body: {
      step_id: data.stepId,
      session_id: data.sessionId,
    },
  });
};

export const recordCtaClick = async (
  slug: string,
  data: { ctaId?: string; stepId?: string; sessionId?: string }
): Promise<void> => {
  await request(`/public/${encodeURIComponent(slug)}/cta-click`, {
    method: 'POST',
    body: {
      cta_id: data.ctaId,
      step_id: data.stepId,
      session_id: data.sessionId,
    },
  });
};

export const submitEmailCapture = async (
  slug: string,
  payload: { email: string; sessionId?: string }
): Promise<void> => {
  await request(`/public/${encodeURIComponent(slug)}/submit-email`, {
    method: 'POST',
    body: {
      email: payload.email,
      session_id: payload.sessionId,
    },
  });
};

export const fetchPublicProducts = async (
  params?: { sort?: 'popular' | 'latest'; limit?: number; offset?: number; seller_username?: string; lp_id?: string }
): Promise<any> => {
  return request('/products/public', {
    params: {
      sort: params?.sort,
      limit: params?.limit,
      offset: params?.offset,
      seller_username: params?.seller_username,
      lp_id: params?.lp_id,
    },
  });
};

export const purchaseProduct = async (
  productId: string,
  payload: Record<string, unknown>
): Promise<any> => {
  return request(`/products/${encodeURIComponent(productId)}/purchase`, {
    method: 'POST',
    body: payload,
    auth: true,
  });
};

export const fetchProductDetail = async (productId: string): Promise<any> => {
  return request(`/products/${encodeURIComponent(productId)}`, {
    auth: true,
  });
};

export const fetchPointsBalance = async (): Promise<any> => {
  return request('/points/balance', {
    auth: true,
  });
};

export const fetchUserProfile = async (username: string): Promise<any> => {
  return request(`/public/users/${encodeURIComponent(username)}`);
};

export const fetchPublicNotes = async (
  params?: { limit?: number; offset?: number; search?: string; categories?: string[]; author_username?: string; locale?: string }
): Promise<any> => {
  return request('/notes/public', {
    params: {
      limit: params?.limit,
      offset: params?.offset,
      search: params?.search,
      locale: params?.locale,
      author_username: params?.author_username,
      categories: params?.categories,
    },
  });
};

export const fetchPublicNote = async (
  slug: string,
  options?: { accessToken?: string; locale?: string }
): Promise<any> => {
  return request(`/notes/public/${encodeURIComponent(slug)}`, {
    params: options?.locale ? { locale: options.locale } : undefined,
    headers: options?.accessToken
      ? {
          Authorization: `Bearer ${options.accessToken}`,
        }
      : undefined,
  });
};

export const fetchPublicNoteByShareToken = async (
  token: string,
  options?: { accessToken?: string; locale?: string }
): Promise<any> => {
  return request(`/notes/share/${encodeURIComponent(token)}`, {
    params: options?.locale ? { locale: options.locale } : undefined,
    headers: options?.accessToken
      ? {
          Authorization: `Bearer ${options.accessToken}`,
        }
      : undefined,
  });
};
