import { useEffect, type RefObject } from "react";

export function useIntersectionObserver(
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
  options?: IntersectionObserverInit,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, callback, options]);
}
