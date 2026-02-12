
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { arrayBufferToBase64, createPcmBlob, decodeAudioData, base64ToUint8Array } from "../utils/audioUtils";
import { ImageSize } from "../types";

// Helper to ensure API Key exists
const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("API Key not found");
  return key;
};

// --- Live API Class ---
export class LiveSessionClient {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private sessionPromise: Promise<any> | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  
  public onOutputVolume: ((vol: number) => void) | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: getApiKey() });
  }

  async connect(onMessage: (text: string) => void) {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = this.outputAudioContext.createGain();
    outputNode.connect(this.outputAudioContext.destination);

    // Analyze output volume for visualizer
    const analyser = this.outputAudioContext.createAnalyser();
    analyser.fftSize = 256;
    outputNode.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateVolume = () => {
       analyser.getByteFrequencyData(dataArray);
       let sum = 0;
       for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
       const avg = sum / dataArray.length;
       if (this.onOutputVolume) this.onOutputVolume(avg);
       requestAnimationFrame(updateVolume);
    };
    updateVolume();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          console.log("Live session opened");
          if (!this.inputAudioContext) return;
          
          const source = this.inputAudioContext.createMediaStreamSource(stream);
          const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createPcmBlob(inputData);
            this.sessionPromise?.then(session => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(this.inputAudioContext.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
           // Handle Audio
           const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
           if (base64Audio && this.outputAudioContext) {
             const audioCtx = this.outputAudioContext;
             this.nextStartTime = Math.max(this.nextStartTime, audioCtx.currentTime);
             
             const audioBuffer = await decodeAudioData(
               base64ToUint8Array(base64Audio),
               audioCtx,
               24000,
               1
             );
             
             const source = audioCtx.createBufferSource();
             source.buffer = audioBuffer;
             source.connect(outputNode);
             source.start(this.nextStartTime);
             this.nextStartTime += audioBuffer.duration;
             this.sources.add(source);
             source.onended = () => this.sources.delete(source);
           }

           // Handle interruption
           if (msg.serverContent?.interrupted) {
             this.sources.forEach(s => s.stop());
             this.sources.clear();
             this.nextStartTime = 0;
           }
        },
        onclose: () => console.log("Live session closed"),
        onerror: (e) => console.error("Live session error", e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction: "You are a knowledgeable and calm literary companion. Discuss books, analyze themes, and read excerpts with a soothing tone."
      }
    });
  }

  async disconnect() {
    if (this.inputAudioContext) await this.inputAudioContext.close();
    if (this.outputAudioContext) await this.outputAudioContext.close();
    this.ai = new GoogleGenAI({ apiKey: getApiKey() });
  }
}

// --- Image & Video Services ---

export const generateImage = async (prompt: string, size: ImageSize): Promise<string> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        throw new Error("KEY_REQUIRED");
      }
  }

  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const mimeType = "image/png"; 
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.replace(/^data:image\/\w+;base64,/, ""), mimeType } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No edited image returned");
};

export const generateVideo = async (prompt: string, base64Image: string): Promise<string> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        throw new Error("KEY_REQUIRED");
      }
  }

  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const rawBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Animate this naturally.",
    image: {
      imageBytes: rawBase64,
      mimeType: 'image/png'
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) throw new Error("Video generation failed");

  const vidRes = await fetch(`${uri}&key=${getApiKey()}`);
  const blob = await vidRes.blob();
  return URL.createObjectURL(blob);
};

// --- TTS Service ---
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("TTS generation failed");
  
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// --- Search Service ---
export const searchBooks = async (query: string): Promise<{ text: string; links: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Recommend 5 trending books about: ${query}. Return a short summary for each.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "No results found.";
  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return { text, links };
};
