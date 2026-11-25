/**
 * Word-by-word token diffing algorithm (LCS-based or token matching)
 */
export function computeWordDiff(origText, augText) {
  if (!origText && !augText) return [];
  if (!origText) return augText.split(/\s+/).map(w => ({ type: 'added', text: w }));
  if (!augText) return origText.split(/\s+/).map(w => ({ type: 'deleted', text: w }));

  const origTokens = origText.split(/(\s+)/);
  const augTokens = augText.split(/(\s+)/);

  const diffResult = [];
  let i = 0;
  let j = 0;

  while (i < origTokens.length || j < augTokens.length) {
    if (i < origTokens.length && j < augTokens.length) {
      if (origTokens[i] === augTokens[j]) {
        diffResult.push({ type: 'unchanged', text: origTokens[i] });
        i++;
        j++;
      } else {
        // Look ahead for matching tokens
        let matchInAug = augTokens.slice(j, j + 5).indexOf(origTokens[i]);
        let matchInOrig = origTokens.slice(i, i + 5).indexOf(augTokens[j]);

        if (matchInAug !== -1) {
          // Tokens added in augmented
          for (let k = 0; k < matchInAug; k++) {
            diffResult.push({ type: 'added', text: augTokens[j + k] });
          }
          j += matchInAug;
        } else if (matchInOrig !== -1) {
          // Tokens deleted from original
          for (let k = 0; k < matchInOrig; k++) {
            diffResult.push({ type: 'deleted', text: origTokens[i + k] });
          }
          i += matchInOrig;
        } else {
          // Replacement
          diffResult.push({ type: 'deleted', text: origTokens[i] });
          diffResult.push({ type: 'added', text: augTokens[j] });
          i++;
          j++;
        }
      }
    } else if (i < origTokens.length) {
      diffResult.push({ type: 'deleted', text: origTokens[i] });
      i++;
    } else {
      diffResult.push({ type: 'added', text: augTokens[j] });
      j++;
    }
  }

  return diffResult;
}

