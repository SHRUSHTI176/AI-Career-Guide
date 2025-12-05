import { useEffect, useRef, useState } from "react";
import { cleanForSpeech } from "../utils/markdownCleaner";

const useVoice = ({ onTranscript }) => {
  const [state, setState] = useState({
    speaking: false,
    paused: false,
    listening: false,
  });

  const synthRef = useRef(window.speechSynthesis || null);
  const recogRef = useRef(null);
  const voicesRef = useRef([]);
  const latestTextRef = useRef("");

  const loadVoices = () => {
    const voices = synthRef.current.getVoices();
    if (voices.length > 0) {
      voicesRef.current = voices;
    } else {
      setTimeout(loadVoices, 200);
    }
  };

  const getBestFemaleVoice = () => {
    const voices = voicesRef.current;
    return (
      voices.find(v => /female|woman|siri|zira|aria|jenny/i.test(v.name)) ||
      voices.find(v => v.name.toLowerCase().includes("english")) ||
      voices[0]
    );
  };

  const filterSpeechText = (text) => {
    return cleanForSpeech(text)
      .replace(/[^\w\s.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const speak = (text) => {
    if (!text) return;

    latestTextRef.current = filterSpeechText(text);

    const synth = synthRef.current;
    if (!synth) return;

    if (synth.speaking) synth.cancel();

    const utter = new SpeechSynthesisUtterance(latestTextRef.current);
    utter.voice = getBestFemaleVoice();
    utter.rate = 1;
    utter.pitch = 1.1;

    utter.onstart = () => setState({ speaking: true, paused: false, listening: false });
    utter.onend = () => setState({ speaking: false, paused: false, listening: false });

    synth.speak(utter);
  };

  const startSpeaking = (text) => speak(text);
  const pauseSpeaking = () => synthRef.current.pause();
  const resumeSpeaking = () => synthRef.current.resume();
  const stopSpeaking = () => synthRef.current.cancel();

  useEffect(() => {
    if (!synthRef.current) return;
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.warn("Speech Recognition Not Supported");
      return;
    }

    const R = new window.webkitSpeechRecognition();
    R.lang = "en-IN";
    R.continuous = false;
    R.interimResults = false;

    R.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onTranscript?.(filterSpeechText(transcript));
    };

    R.onstart = () => setState(s => ({ ...s, listening: true }));
    R.onend = () => setState(s => ({ ...s, listening: false }));

    recogRef.current = R;
  }, [onTranscript]);

  return {
    state,
    speak,
    startSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    startListening: () => recogRef.current?.start(),
    stopListening: () => recogRef.current?.stop(),
  };
};

export default useVoice;
