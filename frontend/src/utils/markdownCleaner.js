// Remove characters you don't want the AI voice to read.
const BLOCKED_REGEX = /[#@$%^*&_=<>`~{}|]/g;

export const cleanForSpeech = (text = "") =>
  text.replace(BLOCKED_REGEX, " ");
