/**
 * Split long lines (>140 chars) into natural sequential pages at sentence or clause boundaries.
 */
export function splitIntoPages(fullText: string, maxCharsPerPage = 140): string[] {
  const trimmed = fullText.trim();
  if (trimmed.length <= maxCharsPerPage) return [trimmed];

  const pages: string[] = [];
  // Split on sentence boundaries: periods, exclamation marks, question marks
  const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [trimmed];

  let currentPage = '';
  for (const sentence of sentences) {
    if (sentence.length > maxCharsPerPage) {
      // Split on clauses: semicolons, em-dashes, commas
      const clauses = sentence.match(/[^,;—]+[,;—]+(?:\s+|$)|[^,;—]+$/g) || [sentence];
      for (const clause of clauses) {
        if ((currentPage + clause).trim().length <= maxCharsPerPage) {
          currentPage += clause;
        } else {
          if (currentPage.trim()) pages.push(currentPage.trim());
          currentPage = clause;
        }
      }
    } else if ((currentPage + sentence).trim().length <= maxCharsPerPage) {
      currentPage += sentence;
    } else {
      if (currentPage.trim()) pages.push(currentPage.trim());
      currentPage = sentence;
    }
  }

  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }

  return pages.length > 0 ? pages : [trimmed];
}

export function calculateReadingDwellTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3000, 1500 + words * 300);
}

