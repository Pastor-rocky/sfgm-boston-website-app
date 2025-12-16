import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export const AUTH_QUERY_KEY = ["/api/auth/me"];

export function useAuth() {
  const authToken = localStorage.getItem("auth_token");

  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!authToken,
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !!authToken,
  };
}
