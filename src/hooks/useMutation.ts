import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

async function mutationFetcher<TResponse, TBody>(
  url: string,
  { arg }: { arg: { method: HttpMethod; body?: TBody } },
): Promise<TResponse> {
  const response = await fetch(url, {
    method: arg.method,
    headers: { "Content-Type": "application/json" },
    body: arg.body ? JSON.stringify(arg.body) : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? `Request failed with status ${response.status}`);
  }

  return result;
}

interface UseMutationOptions<TResponse, TBody>
  extends Omit<
    SWRMutationConfiguration<TResponse, Error, string, { method: HttpMethod; body?: TBody }>,
    "fetcher"
  > {
  method?: HttpMethod;
}

export function useMutation<TResponse, TBody = unknown>(
  url: string,
  options: UseMutationOptions<TResponse, TBody> = {},
) {
  const { method = "POST", ...swrOptions } = options;

  const { trigger, isMutating, error, data, reset } = useSWRMutation<
    TResponse,
    Error,
    string,
    { method: HttpMethod; body?: TBody }
  >(url, mutationFetcher, swrOptions);

  const mutate = async (body?: TBody) => {
    return trigger({ method, body });
  };

  return {
    mutate,
    isMutating,
    error,
    data,
    reset,
  };
}
