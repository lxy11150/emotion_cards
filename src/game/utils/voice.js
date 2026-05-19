export function chooseKidFriendlyVoice(voices) {
  const zhVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("zh"));
  const candidates = zhVoices.length ? zhVoices : voices;
  const preferredWords = [
    "child",
    "kid",
    "children",
    "xiaoxiao",
    "xiaoyi",
    "xiaobei",
    "yunxi",
    "tingting",
    "huihui",
    "meijia",
    "female",
    "natural",
    "晓晓",
    "晓伊",
    "儿童",
    "童声",
  ];

  const scoreVoice = (voice) =>
    preferredWords.reduce(
      (score, word, index) =>
        voice.name.toLowerCase().includes(word.toLowerCase()) ? score + (preferredWords.length - index) : score,
      voice.lang?.toLowerCase().startsWith("zh-cn") ? 5 : 0,
    );

  return [...candidates].sort((left, right) => scoreVoice(right) - scoreVoice(left))[0] || null;
}
