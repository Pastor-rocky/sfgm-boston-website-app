import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<any> {
  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";

  // Only log in development to avoid exposing sensitive data in production
  if (process.env.NODE_ENV === 'development') {
    console.log('API Request:', { method, url, usesCookies: true });
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });

    // Return null for 401 (unauthorized) or 500 (server errors) when using returnNull behavior
    // This allows graceful fallback for auth queries when the server is experiencing issues
    if (unauthorizedBehavior === "returnNull" && (res.status === 401 || res.status === 500)) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Allow cache invalidation
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
