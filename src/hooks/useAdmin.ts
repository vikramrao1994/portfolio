import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

/** Minimal shape of a mutation result needed for status aggregation. */
interface MutationStatus {
  isError: boolean;
  isSuccess: boolean;
  isPending: boolean;
  error: { message: string } | null;
}

/**
 * Aggregates error/success/pending state from multiple TanStack Query mutations.
 * Shared across all admin domain hooks to avoid duplication.
 */
function aggregateMutationState(...mutations: MutationStatus[]) {
  return {
    hasError: mutations.some((m) => m.isError),
    isSuccess: mutations.some((m) => m.isSuccess) && mutations.every((m) => !m.isError),
    error: mutations.find((m) => m.isError)?.error?.message,
    isPending: mutations.some((m) => m.isPending),
  };
}

// ---------------------------------------------------------------------------
// Heading (single-row: query + update)
// ---------------------------------------------------------------------------

export const useHeading = () => {
  const trpc = useTRPC();

  const { data: heading, isLoading, refetch } = useQuery(trpc.heading.getRaw.queryOptions());

  const updateMutation = useMutation(
    trpc.heading.update.mutationOptions({ onSuccess: () => refetch() }),
  );

  return {
    heading,
    isLoading,
    updateMutation,
    ...aggregateMutationState(updateMutation),
  };
};

// ---------------------------------------------------------------------------
// About Me (multi-row: query + create / update / delete)
// ---------------------------------------------------------------------------

export interface AboutMeItem {
  dbId: number; // Renamed from 'id' to avoid conflict with useFieldArray's internal 'id'
  sort_order: number;
  en: string;
  de: string;
}

export const useAboutMe = () => {
  const trpc = useTRPC();

  const { data: items, isLoading, refetch } = useQuery(trpc.aboutMe.getAll.queryOptions());

  // Transform server data: rename 'id' → 'dbId' to avoid useFieldArray conflict
  const transformedItems: AboutMeItem[] | undefined = items?.map((item) => ({
    dbId: item.id,
    sort_order: item.sort_order,
    en: item.en,
    de: item.de,
  }));

  const updateMutation = useMutation(
    trpc.aboutMe.update.mutationOptions({ onSuccess: () => refetch() }),
  );
  const createMutation = useMutation(
    trpc.aboutMe.create.mutationOptions({ onSuccess: () => refetch() }),
  );
  const deleteMutation = useMutation(
    trpc.aboutMe.delete.mutationOptions({ onSuccess: () => refetch() }),
  );

  return {
    items: transformedItems,
    isLoading,
    updateMutation,
    createMutation,
    deleteMutation,
    ...aggregateMutationState(updateMutation, createMutation, deleteMutation),
  };
};
