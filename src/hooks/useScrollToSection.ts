"use client";

import { useCallback } from "react";

export function useScrollToSection() {
  return useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);
}
