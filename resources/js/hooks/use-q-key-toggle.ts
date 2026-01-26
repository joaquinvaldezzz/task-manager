import { useEffect } from "react";

function isInputElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.contentEditable === "true"
  );
}

export function useQKeyToggle(onToggle: (open: boolean) => void): void {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "q" && !isInputElement(event.target)) {
        event.preventDefault();
        onToggle(true);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [onToggle]);
}
