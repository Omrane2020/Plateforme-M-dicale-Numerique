// src/hooks/useAppNavigation.ts
import { useNavigate } from "react-router-dom";

export function useAppNavigation() {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    console.log("[Navigation] Page demandée:", page);
    if (page.startsWith('/')) navigate(page);
    else navigate(`/${page}`);
  };

  return handleNavigate;
}
