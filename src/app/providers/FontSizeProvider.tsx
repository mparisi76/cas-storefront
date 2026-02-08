"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type FontSize = -1 | 0 | 1 | 2 | 3;

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(0);

  useEffect(() => {
    const savedSize = localStorage.getItem("cas-ui-font-size");
    
    // We wrap this in a timeout to push the execution to the next event loop tick.
    // This prevents the "cascading render" error by letting the mount finish first.
    const timeoutId = setTimeout(() => {
      if (savedSize) {
        const parsedSize = parseInt(savedSize) as FontSize;
        setFontSizeState(parsedSize);
        document.documentElement.setAttribute("data-font-size", savedSize);
      } else {
        document.documentElement.setAttribute("data-font-size", "0");
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    document.documentElement.setAttribute("data-font-size", size.toString());
    localStorage.setItem("cas-ui-font-size", size.toString());
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
}