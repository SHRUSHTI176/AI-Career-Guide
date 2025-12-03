import { useEffect, useRef, useState } from "react";
import { cleanForSpeech } from "../utils/markdownCleaner";

export const useVoice = ({ onTranscript }) => {
  const [state, setState] = useState({
    speaking: false,
    paused: false,
    listening: false,
  });

  const synthRef = useRef(window.speechSynthesis || null);
  const recogRef = useRef(null);
  const voicesRef = useRef([]);
  const latestTextRef = useRef(""); // NEW: stores latest AI message

  const loadVoices = () => {
    const voices = synthRef.current.getVoices();
    voicesRef.current = voices;
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
    const synth = synthRef.current;
    if (!synth) return;

    const cleanedText = filterSpeechText(text);
    if (!cleanedText) return;

    latestTextRef.current = cleanedText;

    if (synth.speaking) synth.cancel();

    const utter = new SpeechSynthesisUtterance(cleanedText);

    const voice = getBestFemaleVoice();
    if (voice) utter.voice = voice;

    utter.pitch = 1;
    utter.rate = 1;

    utter.onstart = () =>
      setState({ speaking: true, paused: false, listening: false });

    utter.onend = () =>
      setState({ speaking: false, paused: false, listening: false });

    synth.speak(utter);
  };

  const startSpeaking = () => {
    speak(latestTextRef.current);
  };

  const pauseSpeaking = () => {
    const synth = synthRef.current;
    if (synth?.speaking && !synth.paused) {
      synth.pause();
      setState((prev) => ({ ...prev, paused: true }));
    }
  };

  const resumeSpeaking = () => {
    const synth = synthRef.current;
    if (synth?.paused) {
      synth.resume();
      setState((prev) => ({ ...prev, paused: false }));
    }
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setState({ speaking: false, paused: false, listening: false });
  };

  useEffect(() => {
    if (!synthRef.current) return;
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // ⭐ Speech-to-text (unchanged from your old code)
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const Rec = window.webkitSpeechRecognition;
      const recog = new Rec();
      recog.lang = "en-IN";
      recog.continuous = false;
      recog.interimResults = false;

      recog.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (onTranscript) onTranscript(filterSpeechText(transcript));
      };

      recog.onstart = () =>
        setState((s) => ({ ...s, listening: true }));
      recog.onend = () =>
        setState((s) => ({ ...s, listening: false }));

      recogRef.current = recog;
    }
  }, [onTranscript]);

  const startListening = () => {
    try {
      recogRef.current?.start();
    } catch {
      alert("Voice input not supported in this browser");
    }
  };

  const stopListening = () => {
    recogRef.current?.stop();
  };

  return {
    state,
    latestTextRef,
    startSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    startListening,
    stopListening,
  };
};
