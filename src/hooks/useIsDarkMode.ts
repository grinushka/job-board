import { useEffect, useState } from "react";

const DARK_THEME_MEDIA = "(prefers-color-scheme: dark)";

export function useIsDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(DARK_THEME_MEDIA).matches;
  });

  useEffect(() => {
    const controller = new AbortController();
    window.matchMedia(DARK_THEME_MEDIA).addEventListener(
      "change",
      e => {
        setIsDarkMode(e.matches);
      },
      { signal: controller.signal }
    );

    return () => {
      controller.abort();
    };
  }, []);

  return isDarkMode;
}