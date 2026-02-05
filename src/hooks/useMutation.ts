import { useMutation as useReactQueryMutation } from "@tanstack/react-query";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

async function mutationFetcher<TResponse, TBody>(
  url: string,
  method: HttpMethod,
  body?: TBody,
): Promise<TResponse> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? `Request failed with status ${response.status}`);
  }

  return result;
}

interface UseMutationOptions<TResponse> {
  method?: HttpMethod;
  onSuccess?: (data: TResponse) => void;
  onError?: (error: Error) => void;
}

export function useMutation<TResponse, TBody = unknown>(
  url: string,
  options: UseMutationOptions<TResponse> = {},
) {
  const { method = "POST", onSuccess, onError } = options;

  const mutation = useReactQueryMutation<TResponse, Error, TBody | undefined>({
    mutationFn: (body) => mutationFetcher<TResponse, TBody>(url, method, body),
    onSuccess,
    onError,
  });

  const mutate = async (body?: TBody) => {
    return mutation.mutateAsync(body);
  };

  return {
    mutate,
    isMutating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
