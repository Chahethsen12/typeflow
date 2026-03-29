import type { TestResult } from '../components/Dashboard';

const WORD_BANK = [
  "the", "of", "and", "a", "to", "in", "is", "you", "that", "it", "he",
  "was", "for", "on", "are", "as", "with", "his", "they", "i", "at", 
  "be", "this", "have", "from", "or", "one", "had", "by", "word",
  "but", "not", "what", "all", "were", "we", "when", "your", "can",
  "said", "there", "use", "an", "each", "which", "she", "do", "how",
  "their", "if", "will", "up", "other", "about", "out", "many", "then",
  "them", "these", "so", "some", "her", "would", "make", "like", "him", 
  "into", "time", "has", "look", "two", "more", "write", "go", "see",
  "number", "no", "way", "could", "people", "my", "than", "first",
  // specialized typeflow vocabulary
  "component", "react", "typeflow", "typing", "practice", "accuracy", "speed",
  "developer", "software", "aesthetic", "premium", "performance",
  "interface", "responsive", "dynamic", "quality", "keyboard", "mechanics",
  "algorithm", "function", "variable", "application", "system", "design"
];

export const generateAdaptiveText = (history: TestResult[]): string => {
  // If no history, just give a random string of 25 words
  if (!history || history.length === 0) {
    const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 25).join(' ');
  }

  // Calculate absolute top 3 weak keys across entire test history
  const globalWeakKeys: Record<string, number> = {};
  history.forEach(h => {
    Object.entries(h.weakKeys || {}).forEach(([key, count]) => {
      globalWeakKeys[key] = (globalWeakKeys[key] || 0) + count;
    });
  });

  const topWeakKeys = Object.entries(globalWeakKeys)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => key.toLowerCase())
    .filter(k => k.length === 1 && k.match(/[a-z]/i)); // only filter valid letters

  // If no legitimate letter-based weak keys exist yet, return normal random text
  if (topWeakKeys.length === 0) {
    const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 25).join(' ');
  }

  // AI-Logic: Partition the word bank into words containing at least 1 weak key vs completely safe words
  const weakKeyWords = WORD_BANK.filter(word => 
    topWeakKeys.some(key => word.includes(key))
  );

  const safeWords = WORD_BANK.filter(word => 
    !topWeakKeys.some(key => word.includes(key))
  );

  const finalSequence: string[] = [];
  const targetWordCount = 25;

  for (let i = 0; i < targetWordCount; i++) {
    // 60% chance to force a word containing one of their worst-performing keys!
    // 40% chance to use a regular word so the sentence still has rhythm.
    const useWeakKeyWord = Math.random() > 0.4 && weakKeyWords.length > 0;
    
    if (useWeakKeyWord) {
      finalSequence.push(weakKeyWords[Math.floor(Math.random() * weakKeyWords.length)]);
    } else {
      const sourceList = safeWords.length > 0 ? safeWords : WORD_BANK;
      finalSequence.push(sourceList[Math.floor(Math.random() * sourceList.length)]);
    }
  }

  return finalSequence.join(' ');
};
