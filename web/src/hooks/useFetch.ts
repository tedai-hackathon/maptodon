import { useState, useEffect, useCallback } from "react";

type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: T };

const useFetch = <T>(initialUrl: string) => {
  const [url, setUrl] = useState(initialUrl);
  const [fetchState, setFetchState] = useState<FetchState<T>>({
    status: "idle",
  });

  const fetchData = useCallback(async () => {
    console.log("now fetching", url ?? "none");
    if (!url) {
      console.log("not fetching, no url");
      return;
    }
    setFetchState({ status: "loading" });

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: T = await response.json();
      setFetchState({ status: "success", data });
    } catch (error) {
      setFetchState({ status: "error", error: error as Error });
    }
  }, [url]);

  const refetch = () => {
    fetchData();
  };

  return { ...fetchState, refetch, setUrl };
};

export default useFetch;
