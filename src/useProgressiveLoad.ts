import {
  hashKey,
  type UndefinedInitialDataOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { throttle } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";

export interface useProgressiveLoadOptions {
  updateThrottleMs?: number;
}

export default function useProgressiveLoad<T>(
  queries: UndefinedInitialDataOptions<T>[],
  { updateThrottleMs = 250 }: useProgressiveLoadOptions = {},
) {
  const [data, setData] = useState<{ data: T | undefined; stale: boolean }[]>(
    [],
  );

  const queryClient = useQueryClient();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | undefined>(undefined);

  // throttle react updates for performance reasons
  const setDataThrottled = useMemo(
    () => throttle(setData, updateThrottleMs, { trailing: true }),
    [updateThrottleMs],
  );

  // make a stable key for queries, so we only update if the actual _content_ changes
  // this makes it stable even when constructing arrays inline
  const stableKey = useMemo(
    () => queries.map((options) => hashKey(options.queryKey)).join(),
    [queries],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: we're using stableKey instead of queries
  useEffect(() => {
    setError(undefined);

    controllerRef.current = new AbortController();
    const cache = queryClient.getQueryCache();

    // find out what we've got in the cache already
    const cached = queries.map(
      (options) =>
        [
          options,
          cache.find<T>({ queryKey: options.queryKey, exact: true }),
        ] as const,
    );

    // update our results with whatever we found
    setDataThrottled(
      cached.map(([, query]) => ({
        data: query?.state.data,
        stale: !query || query.isStale(),
      })),
    );

    // subscribe to changes so we have the latest data
    const unsubscribe = cache.subscribe((event) => {
      // we only care about updated events and when the data is actually available
      if (event.type !== "updated" || event.query.state.data === undefined)
        return;

      // this has the effect of updating the item in place
      // if we had it already, and ignoring it otherwise
      // we deliberately keep our results in the same order as the queries
      const index = queries.findIndex(
        (query) => hashKey(query.queryKey) === hashKey(event.query.queryKey),
      );

      if (index > -1) {
        setDataThrottled((data) =>
          data.map((item, i) =>
            i === index ? { data: event.query.state.data, stale: false } : item,
          ),
        );
      }
    });

    // figure out if we need to fetch/refetch anything
    const toFetch = cached.filter(([, query]) => !query || query.isStale());

    // fetch whatever we didn't have already
    if (toFetch.length) {
      (async () => {
        setLoading(true);

        try {
          await Promise.all(
            toFetch.map(async ([options]) => {
              if (controllerRef.current?.signal.aborted) return;

              // let the cache subscription above update it in place
              await queryClient.prefetchQuery(options);
            }),
          );
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }

    return () => {
      unsubscribe();
      setDataThrottled.cancel();
      controllerRef.current?.abort();
      controllerRef.current = undefined;
    };
  }, [stableKey, setDataThrottled, queryClient]);

  return {
    error,
    data,
    loading,
    count: queries.length,
    fetched: data.filter((x) => !x.stale).length,
  };
}
