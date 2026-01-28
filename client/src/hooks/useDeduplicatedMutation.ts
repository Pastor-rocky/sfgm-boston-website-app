/**
 * Hook for deduplicating mutation requests
 * Prevents duplicate API calls when user clicks rapidly
 */

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useRef } from "react";

export interface DeduplicatedMutationOptions<TData, TVariables> {
  dedupeKey: (variables: TVariables) => string;
  dedupeWindowMs?: number;
  mutationOptions?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">;
}

/**
 * Creates a mutation hook with request deduplication
 * 
 * @example
 * const progressMutation = useDeduplicatedMutation(
 *   async (data) => apiRequest('POST', '/api/content-progress', data),
 *   {
 *     dedupeKey: (data) => `${data.courseId}-${data.contentType}-${data.contentId}`,
 *     dedupeWindowMs: 2000,
 *   }
 * );
 */
export function useDeduplicatedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: DeduplicatedMutationOptions<TData, TVariables>
) {
  const { dedupeKey, dedupeWindowMs = 2000, mutationOptions = {} } = options;
  const pendingRequests = useRef<Map<string, Promise<TData>>>(new Map());
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: TVariables) => {
      const key = dedupeKey(variables);
      const existing = pendingRequests.current.get(key);
      
      if (existing) {
        console.log('[Deduplication] Reusing existing request:', key);
        return existing;
      }

      const promise = mutationFn(variables);
      pendingRequests.current.set(key, promise);
      
      try {
        const result = await promise;
        return result;
      } catch (error) {
        // Remove on error so it can be retried
        pendingRequests.current.delete(key);
        throw error;
      } finally {
        // Clean up after dedupe window
        setTimeout(() => {
          pendingRequests.current.delete(key);
        }, dedupeWindowMs);
      }
    },
    ...mutationOptions,
  });

  return mutation;
}
