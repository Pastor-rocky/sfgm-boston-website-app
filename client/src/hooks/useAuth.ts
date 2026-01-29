import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export const AUTH_QUERY_KEY = ["/api/auth/me"];

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getQueryFn<User>({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
  };
}
