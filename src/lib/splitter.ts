/**
 * A TypeScript implementation of a Recursive Character Text Splitter.
 * Splits text recursively by a list of separators until the chunk sizes are within the limit.
 */
export class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(options: { chunkSize?: number; chunkOverlap?: number; separators?: string[] } = {}) {
    this.chunkSize = options.chunkSize ?? 1000;
    this.chunkOverlap = options.chunkOverlap ?? 200;
    this.separators = options.separators ?? ["\n\n", "\n", " ", ""];
  }

  /**
   * Split a text into chunks.
   */
  public splitText(text: string): string[] {
    const finalChunks: string[] = [];
    const splits = this.split(text, this.separators);

    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const split of splits) {
      const len = split.length;

      // If a single split exceeds chunkSize, put it in its own chunk
      if (len > this.chunkSize) {
        if (currentChunk.length > 0) {
          finalChunks.push(currentChunk.join(""));
          currentChunk = [];
          currentLength = 0;
        }
        finalChunks.push(split);
        continue;
      }

      if (currentLength + len > this.chunkSize) {
        finalChunks.push(currentChunk.join(""));
        
        // Retain overlap: take splits from the end of currentChunk that fit in overlap
        const overlapped: string[] = [];
        let overlapLen = 0;
        for (let i = currentChunk.length - 1; i >= 0; i--) {
          const item = currentChunk[i];
          if (overlapLen + item.length <= this.chunkOverlap) {
            overlapped.unshift(item);
            overlapLen += item.length;
          } else {
            break;
          }
        }
        currentChunk = overlapped;
        currentLength = overlapLen;
      }

      currentChunk.push(split);
      currentLength += len;
    }

    if (currentChunk.length > 0) {
      finalChunks.push(currentChunk.join(""));
    }

    return finalChunks.filter(chunk => chunk.trim().length > 0);
  }

  private split(text: string, separators: string[]): string[] {
    if (separators.length === 0) {
      return [text];
    }

    const separator = separators[0];
    const nextSeparators = separators.slice(1);
    const parts = text.split(separator);
    const result: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      // Re-add separator to all but the last item (re-establishes punctuation/flow)
      const partWithSeparator = i < parts.length - 1 ? part + separator : part;

      if (partWithSeparator.length <= this.chunkSize) {
        result.push(partWithSeparator);
      } else {
        // Recursively split the part that is too long with the next level of separators
        const subSplits = this.split(partWithSeparator, nextSeparators);
        result.push(...subSplits);
      }
    }

    return result;
  }
}
