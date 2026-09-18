export function createProductSearchTokens(
  name: string
): string[] {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  const tokens = new Set<string>();

  // Only generate searchable strings of 3+ characters
  for (let start = 0; start < normalized.length; start++) {
    for (
      let end = start + 3;
      end <= normalized.length;
      end++
    ) {
      tokens.add(normalized.slice(start, end));
    }
  }

  return Array.from(tokens);
}