export const themedNames = ['fusion', 'ai', 'winking', 'deal'].flatMap(project =>
  ['experience', 'approach'].map(part => `${project}-${part}`)).concat(
  ['fx-states-today', 'fx-states-designed', 'fx-fills-today', 'fx-fills-designed', 'fx-data-layers']);
const darkPaints = `
@media (prefers-color-scheme: dark) {
  [fill="#272B32"] { fill:#edf1f5 }
  [fill="#555D68"], [fill="#9AA3AD"] { fill:#b7c1ce }
  [fill="#F7F8FA"] { fill:#222832 }
  circle[fill="#2F6FB5"][fill-opacity] { fill:#9dccef }
  [stroke="#E6E9EE"] { stroke:#3b4654 }
  [stroke="#3A3F47"] { stroke:#edf1f5 }
  [fill="#F3F8FA"], [fill="#F7F5FD"], [fill="#FFFDF8"], [fill="#FBF8F8"], rect[fill="white"] { fill:#222832 }
  [stroke="#D9DDE2"], [stroke="#DED6C8"] { stroke:#3b4654 }
  [stroke="#4F98B0"] { stroke:#8ac7d9 }
  [stroke="#7C5CD6"], [stroke="#6A4BD0"] { stroke:#bda6f4 }
  [stroke="#2F7A4A"] { stroke:#a6d3af }
  [stroke="#8A2D3B"] { stroke:#e5a8b4 }
}`;

export function explicitThemeArtwork(original: string, name: string, theme: "light" | "dark"): string {
  const paints = name === 'fx-data-layers' ? `
@media (prefers-color-scheme: light) {
  [fill="#fff"] { fill:#272b32 }
  [stroke="#454545"] { stroke:#a4abb4 }
  [fill="#61a6fa"] { fill:#28639b }
  [stroke="#61a6fa"] { stroke:#28639b }
  [fill="#8c5cf5"] { fill:#6741b6 }
  [stroke="#8c5cf5"] { stroke:#6741b6 }
  [fill="#2ed4bf"] { fill:#19796c }
  [stroke="#2ed4bf"] { stroke:#19796c }
  [fill="#fa9e24"] { fill:#995d13 }
  [stroke="#fa9e24"] { stroke:#995d13 }
}` : darkPaints;
  const applies = name === "fx-data-layers" ? theme === "light" : theme === "dark";
  const rules = applies ? paints.replace(/@media[^\{]+\{/, "").replace(/\}\s*$/, "") : "";
  return original.replace(/(<svg\b[^>]*>)/, `$1<style>${rules}</style>`);
}
