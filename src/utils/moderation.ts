import { BANNED_EXACT_WORDS, BANNED_WORDS } from "@/constants/bannedWords";

const SUBSTITUTIONS: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[013457@$]/g, (char) => SUBSTITUTIONS[char] ?? char)
    .replace(/[^a-z]/g, "")
    .replace(/(.)\1+/g, "$1");
}

const LONG_WORDS = BANNED_WORDS.map(normalize).filter(Boolean);
const EXACT_WORDS = new Set(BANNED_EXACT_WORDS.map(normalize));

function splitWords(text: string): string[] {
  const parts = text.split(/[^A-Za-zÀ-ÿ0-9@$]+/).filter(Boolean);
  const words: string[] = [];
  let run = "";

  for (const part of parts) {
    if (part.length === 1) {
      run += part;
    } else {
      if (run) {
        words.push(run);
        run = "";
      }
      words.push(part);
    }
  }
  if (run) words.push(run);

  return words.map(normalize).filter(Boolean);
}

export function containsBannedWord(text: string): boolean {
  const tokens = splitWords(text);

  if (tokens.some((token) => LONG_WORDS.some((word) => token.includes(word)))) {
    return true;
  }
  return tokens.some((token) => EXACT_WORDS.has(token));
}
