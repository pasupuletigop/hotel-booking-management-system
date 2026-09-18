const chunkText = (
  text,
  chunkSize = 1200,
  overlap = 200
) => {
  if (!text || !text.trim()) {
    return [];
  }

  const cleanedText = text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const chunks = [];

  let start = 0;

  while (start < cleanedText.length) {
    let end = start + chunkSize;

    if (end < cleanedText.length) {
      const paragraphBreak =
        cleanedText.lastIndexOf(
          "\n\n",
          end
        );

      const sentenceBreak =
        cleanedText.lastIndexOf(
          ". ",
          end
        );

      if (
        paragraphBreak > start + chunkSize * 0.6
      ) {
        end = paragraphBreak;
      } else if (
        sentenceBreak > start + chunkSize * 0.6
      ) {
        end = sentenceBreak + 1;
      }
    }

    const chunk = cleanedText
      .slice(start, end)
      .trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= cleanedText.length) {
      break;
    }

    start = Math.max(
      end - overlap,
      start + 1
    );
  }

  return chunks;
};

module.exports = chunkText;