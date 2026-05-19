import { createElement } from "react";

export function ruby(text, py) {
  return createElement("ruby", null, text, createElement("rt", null, py));
}

export function speechTextForTip(tip) {
  if (!tip) return "";
  return tip.skipTitleInSpeech ? tip.text : `${tip.title}。${tip.text}`;
}
