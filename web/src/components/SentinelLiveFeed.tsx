import React, { useState, useRef } from 'react';
import type { PropertyRecord, IncidentDetection } from '../types.js';
import {
  Sun,
  BatteryCharging,
  Signal,
  ShieldAlert,
  Volume2,
  Zap,
  FileCheck,
  Camera,
  AlertTriangle,
  VolumeX
} from 'lucide-react';

interface SentinelLiveFeedProps {
  property: PropertyRecord;
  onOpenEvidence: (incident: IncidentDetection) => void;
  onToggleDeterrence: (active: boolean, language: string) => void;
}

export const SentinelLiveFeed: React.FC<SentinelLiveFeedProps> = ({
  property,
  onOpenEvidence,
  onToggleDeterrence
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    property.cadastre.state === 'Telangana'
      ? 'Telugu'
      : property.cadastre.state === 'Punjab'
      ? 'Punjabi'
      : 'Kannada'
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const node = property.sentinelNode;
  const isDeterrenceActive = node.systemStatus === 'DETERRENCE_ACTIVE';
  const latestIncident = property.activeIncidents[0];

  // Synthesize authentic 110dB Siren Alarm Tone using Web Audio API
  const playSirenTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);

      // Alternating 850Hz to 1150Hz police siren oscillation
      const startTime = ctx.currentTime;
      for (let i = 0; i < 8; i++) {
        osc.frequency.setValueAtTime(850, startTime + i * 0.5);
        osc.frequency.linearRampToValueAtTime(1150, startTime + i * 0.5 + 0.25);
        osc.frequency.linearRampToValueAtTime(850, startTime + i * 0.5 + 0.5);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(startTime + 4);

      setIsPlayingAudio(true);
      setTimeout(() => {
        setIsPlayingAudio(false);
        speakWarning(selectedLanguage);
      }, 4000);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
      speakWarning(selectedLanguage);
    }
  };

  // Vernacular Speech Broadcast Synthesizer
  const speakWarning = (lang: string) => {
    if (!('speechSynthesis' in window)) return;

    const phrases: Record<string, { text: string; code: string }> = {
      Telugu: {
        text: `హెచ్చరిక! సర్వే నంబర్ ${property.cadastre.surveyNumber} పరిధి ఉపగ్రహ నిఘాలో ఉంది. స్థానిక పోలీసులు మరియు భద్రతా బృందానికి సమాచారం అందించబడింది. వెంటనే ఇక్కడి నుంచి వెళ్లిపోండి.`,
        code: 'te-IN'
      },
      Hindi: {
        text: `चेतावनी! सर्वे नंबर ${property.cadastre.surveyNumber} परिधि सैटेलाइट और एआई निगरानी में है। पुलिस और सुरक्षा बल को सूचित कर दिया गया है। तुरंत यहां से हट जाएं।`,
        code: 'hi-IN'
      },
      Punjabi: {
        text: `ਚੇਤਾਵਨੀ! ਸਰਵੇ ਨੰਬਰ ${property.cadastre.surveyNumber} ਪਰਿਧੀ ਸੈਟੇਲਾਈਟ ਨਿਗਰਾਨੀ ਹੇਠ ਹੈ। ਪੁਲਿਸ ਨੂੰ ਸੂਚਿਤ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਤੁਰੰਤ ਬਾਹਰ ਨਿਕਲੋ।`,
        code: 'pa-IN'
      },
      Kannada: {
        text: `ಎಚ್ಚರಿಕೆ! ಸರ್ವೆ ನಂಬರ್ ${property.cadastre.surveyNumber} ಪರಿಧಿ ಉಪಗ್ರಹ ಕಣ್ಗಾವಲಿನಲ್ಲಿದೆ. ಪೊಲೀಸರಿಗೆ ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ. ತಕ್ಷಣವೇ ಹೊರಡಿ.`,
        code: 'kn-IN'
      },
      English: {
        text: `Warning! Survey Number ${property.cadastre.surveyNumber} is under 24/7 Paridhi satellite surveillance. Local police and ground patrol have been alerted. Vacate immediately!`,
        code: 'en-US'
      }
    };

    const target = phrases[lang] || phrases.English;
    const utterance = new SpeechSynthesisUtterance(target.text);
    utterance.lang = target.code;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleSoundSiren = () => {
    onToggleDeterrence(true, selectedLanguage);
    playSirenTone();
  };

  const handleDisarmSiren = () => {
    onToggleDeterrence(false, selectedLanguage);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  return (
    <div className="bg-[#0b1019] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Feed Header */}
      <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Camera className="w-3.5 h-3.5" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-slate-100 font-mono">{node.nodeId}</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                4K STARVIS 2 • LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Solar-LTE Autonomous Sentinel • Dual Sony IMX678 + 6 TOPS NPU
            </p>
          </div>
        </div>

        {/* Live Physical Telemetry Badges */}
        <div className="flex items-center gap-2.5 font-mono text-[11px]">
          {/* Solar Harvest */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-amber-300">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>{node.solarWatts.toFixed(1)} W</span>
          </div>

          {/* LiFePO4 Battery */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-emerald-300">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>{node.batteryPercentage.toFixed(0)}% ({node.batteryVoltage.toFixed(1)}V)</span>
          </div>

          {/* 4G LTE Signal */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-cyan-300">
            <Signal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{node.lteSignalDbm} dBm</span>
          </div>

          {/* Tamper Score */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Tamper: {node.opticalTamperScore.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Simulated 4K HUD Camera Canvas */}
      <div className="relative w-full h-[320px] bg-slate-950 overflow-hidden flex items-center justify-center">
        {/* Synthetic Video Scene Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-[#070b12]" />

        {/* Optical Simulation Canvas */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Camera Perspective Landscape Mock (Simulating Indian plotted land) */}
        <div className="relative w-full h-full flex flex-col justify-end p-6">
          {/* Virtual Sky / Distant Horizon */}
          <div className="absolute top-12 left-0 right-0 h-[1px] bg-slate-800/80" />

          {/* Perspective boundary pegs & virtual tripwire */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Projected Homography Tripwire Vector Line */}
            <svg className="w-full h-full">
              <line
                x1="40"
                y1="240"
                x2="600"
                y2="280"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <text
                x="50"
                y="232"
                fill="#06b6d4"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                CALIBRATED CADASTRAL TRIPWIRE #2 (SURVEY {property.cadastre.surveyNumber})
              </text>
            </svg>
          </div>

          {/* Neural Bounding Box: If there is an active incident */}
          {latestIncident && (
            <div className="absolute top-24 left-1/3 w-64 p-3 border-2 border-red-500 bg-red-950/30 rounded-lg shadow-2xl shadow-red-950/80 backdrop-blur-xs animate-threat-pulse">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-red-400 border-b border-red-500/50 pb-1.5 mb-1.5">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {latestIncident.threatType}
                </span>
                <span>{(latestIncident.confidenceScore * 100).toFixed(0)}% NPU CONF</span>
              </div>
              <p className="text-[11px] text-slate-200 line-clamp-2">
                {latestIncident.description}
              </p>
              <div className="mt-2 pt-1.5 border-t border-red-500/30 flex items-center justify-between">
                <span className="text-[9px] font-mono text-red-300">
                  SHA-256: {latestIncident.sha256Hash.substring(0, 14)}...
                </span>
                <button
                  onClick={() => onOpenEvidence(latestIncident)}
                  className="px-2 py-0.5 rounded bg-red-500 hover:bg-red-600 text-white text-[10px] font-mono font-semibold transition-colors"
                >
                  View BSA 2023 Proof
                </button>
              </div>
            </div>
          )}

          {/* On-Screen Camera HUD Telemetry Overlay */}
          <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-cyan-400 backdrop-blur-sm">
            REC ● STARVIS 4K HDR | NavIC LOCK: 17.2403°N, 78.4294°E | 30 FPS
          </div>

          <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-slate-400 backdrop-blur-sm">
            HW-HSM ATTESTED: OPTIGA TRUST M
          </div>

          {/* Bottom Feed Status */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-300">Continuous Encrypted Edge Buffer</span>
            </div>
            <div>LTE Band 3 (Airtel) • 1.4 Mbps Uplink</div>
          </div>
        </div>
      </div>

      {/* Active Edge Deterrence & Voice Warning Controls */}
      <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Vernacular Language Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Audio Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
            >
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Siren Armed Status Indicator */}
          <div className="text-xs font-mono">
            {isDeterrenceActive ? (
              <span className="text-red-400 font-bold animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                110dB SIREN BROADCASTING
              </span>
            ) : (
              <span className="text-slate-400">Deterrence Standby</span>
            )}
          </div>
        </div>

        {/* Deterrence Trigger Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {isDeterrenceActive ? (
            <button
              onClick={handleDisarmSiren}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
              <span>Disarm Siren & Strobes</span>
            </button>
          ) : (
            <button
              onClick={handleSoundSiren}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-mono font-semibold shadow-lg shadow-red-900/40 transition-colors ${
                isPlayingAudio ? 'bg-red-700 animate-pulse' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isPlayingAudio ? 'Broadcasting Siren & Audio...' : 'Sound 110dB Siren & Voice'}</span>
            </button>
          )}

          {latestIncident && (
            <button
              onClick={() => onOpenEvidence(latestIncident)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>BSA 2023 Vault</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
