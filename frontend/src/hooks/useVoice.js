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

  const loadVoices = () => {
    const voices = synthRef.current.getVoices();
    voicesRef.current = voices;
  };

  const getFemaleVoice = () => {
    const voices = voicesRef.current;

    return (
      voices.find((v) => v.name.includes("Google UK English Female")) ||
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => /Female|Woman|Siri|Zira|Jenny|Aria/i.test(v.name)) ||
      voices[0]
    );
  };

  const filterSpeechText = (text) => {
    return cleanForSpeech(text)
      .replace(/[^\w\s.,!?]/g, "") 
      .replace(/\s+/g, " ")
      .trim();
  };

  let currentUtterance = null;

  const speakText = (text) => {
    const synth = synthRef.current;
    if (!synth) return;

    const cleaned = filterSpeechText(text);
    if (!cleaned) return;

    if (synth.speaking) synth.cancel();

    const utter = new SpeechSynthesisUtterance(cleaned);
    currentUtterance = utter;
    
    utter.pitch = 1;
    utter.rate = 1;
    utter.volume = 1;

    const voice = getFemaleVoice();
    if (voice) utter.voice = voice;

    utter.onstart = () => setState({ speaking: true, paused: false, listening: false });
    utter.onend = () => setState({ speaking: false, paused: false, listening: false });

    synth.speak(utter);
  };

  const pauseSpeaking = () => {
    const synth = synthRef.current;
    if (synth?.speaking && !synth?.paused) {
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
    const synth = synthRef.current;
    synth?.cancel();
    setState({ speaking: false, paused: false, listening: false });
  };

  useEffect(() => {
    if (!synthRef.current) return;
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Voice-to-text setup
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
    speakText,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    startListening,
    stopListening,
  };
};
