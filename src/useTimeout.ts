import { useEffect, useRef } from "react";

export default function useTimeout(
  fn: () => void,
  timeout: number | undefined,
) {
  // if the caller inlines the function
  // we just want to call the most recent one
  // without retriggering the useEffect every time
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (timeout) {
      const handle = setTimeout(fnRef.current, timeout);

      return () => {
        // if we unmount before the timeout fires,
        // clear it
        clearTimeout(handle);
      };
    }
  }, [timeout]);
}
