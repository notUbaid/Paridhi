import React, { useState, useRef, useEffect } from 'react';
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
      : property.cadastre.state === 'Karnataka'
      ? 'Kannada'
      : 'Hindi'
  );

  useEffect(() => {
    setSelectedLanguage(
      property.cadastre.state === 'Telangana'
        ? 'Telugu'
        : property.cadastre.state === 'Punjab'
        ? 'Punjabi'
        : property.cadastre.state === 'Karnataka'
        ? 'Kannada'
        : 'Hindi'
    );
  }, [property.cadastre.state]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const node = property.sentinelNode;
  const isDeterrenceActive = node.systemStatus === 'DETERRENCE_ACTIVE';
  const latestIncident = property.activeIncidents[0];

  const playSirenTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);

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
      console.warn('Web Audio API not supported:', e);
      speakWarning(selectedLanguage);
    }
  };

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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
      {/* Feed Header */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 font-mono">{node.nodeId}</span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                4K Stream Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dual Sony IMX678 HDR • Rockchip RK3588S (6 TOPS Edge NPU)
            </p>
          </div>
        </div>

        {/* Physical Telemetry Indicators */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>{node.solarWatts.toFixed(1)}W Solar</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
            <span>{node.batteryPercentage.toFixed(0)}% ({node.batteryVoltage.toFixed(1)}V)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
            <Signal className="w-3.5 h-3.5 text-blue-600" />
            <span>{node.lteSignalDbm} dBm</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>Tamper: {node.opticalTamperScore.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Optical Feed Viewport Canvas */}
      <div className="relative w-full h-[300px] bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* Subtle realistic ground vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Projected Homography Tripwire Vector Line */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <line
              x1="30"
              y1="220"
              x2="610"
              y2="260"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <text
              x="40"
              y="212"
              fill="#38bdf8"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              CADASTRAL BOUNDARY TRIPWIRE (SURVEY #{property.cadastre.surveyNumber})
            </text>
          </svg>
        </div>

        {/* Real-time Edge AI Detection Bounding Box */}
        {latestIncident && (
          <div className="absolute top-16 left-1/4 max-w-sm p-4 bg-white/95 border-2 border-red-600 rounded-xl shadow-lg backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs font-bold text-red-700 border-b border-red-100 pb-1.5 mb-2">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                {latestIncident.threatType.replace('_', ' ')}
              </span>
              <span className="font-mono text-slate-600 font-medium">
                {(latestIncident.confidenceScore * 100).toFixed(0)}% Confidence
              </span>
            </div>
            <p className="text-xs text-slate-800 leading-snug">
              {latestIncident.description}
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                SHA: {latestIncident.sha256Hash.substring(0, 16)}...
              </span>
              <button
                onClick={() => onOpenEvidence(latestIncident)}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-black text-white text-[11px] font-semibold transition-colors"
              >
                Inspect BSA §63 Certificate
              </button>
            </div>
          </div>
        )}

        {/* On-Screen HUD Metadata */}
        <div className="absolute top-3 left-3 bg-black/70 rounded px-2.5 py-1 text-[11px] font-mono text-slate-200">
          ● STARVIS 4K HDR | NavIC LOCK: {property.cadastre.coordinates[0].latitude.toFixed(4)}°N, {property.cadastre.coordinates[0].longitude.toFixed(4)}°E
        </div>

        <div className="absolute top-3 right-3 bg-black/70 rounded px-2.5 py-1 text-[11px] font-mono text-emerald-400">
          HW-HSM ATTESTED: OPTIGA TRUST M
        </div>
      </div>

      {/* Active Edge Deterrence & Regional Speech Controls */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            <Volume2 className="w-4 h-4 text-slate-500" />
            <span>Evacuation Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:border-slate-900 focus:outline-none shadow-xs"
            >
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className="text-xs font-medium">
            {isDeterrenceActive ? (
              <span className="text-red-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                110dB Directional Horn Active
              </span>
            ) : (
              <span className="text-slate-500">Deterrence Standby</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {isDeterrenceActive ? (
            <button
              onClick={handleDisarmSiren}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5 text-slate-700" />
              <span>Disarm Siren & Horn</span>
            </button>
          ) : (
            <button
              onClick={handleSoundSiren}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors ${
                isPlayingAudio ? 'bg-red-800 animate-pulse' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isPlayingAudio ? 'Broadcasting Siren & Audio...' : 'Sound 110dB Siren & Voice'}</span>
            </button>
          )}

          {latestIncident && (
            <button
              onClick={() => onOpenEvidence(latestIncident)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors shadow-xs"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>View Evidentiary Vault</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
