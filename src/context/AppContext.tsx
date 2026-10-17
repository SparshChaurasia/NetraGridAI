import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Incident, DemoClip, EventLogEntry, SystemHealth } from '../types';
import { INITIAL_INCIDENTS, INITIAL_DEMO_CLIPS, ACCIDENT_PRESETS, CAMERA_LIST, type CameraInfo } from '../lib/mockData';
import { soundManager } from '../lib/audio';

interface OperatorProfile {
  id: string;
  name: string;
  role: string;
  assignedSector: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  operator: OperatorProfile;
  login: (loginId: string, password?: string) => boolean;
  logout: () => void;
  incidents: Incident[];
  activeEscalationIncident: Incident | null;
  isEscalationModalOpen: boolean;
  openEscalationModal: (incident: Incident) => void;
  closeEscalationModal: () => void;
  dismissIncident: (id: string) => void;
  acknowledgeIncident: (id: string) => void;
  dispatchIncident: (id: string, responderType?: string) => void;
  triggerCollision: (customLocation?: string) => Incident;
  activeClip: DemoClip;
  setActiveClip: (clip: DemoClip) => void;
  cameras: CameraInfo[];
  selectedCameraId: string;
  setSelectedCameraId: (id: string) => void;
  phoneOverride: string;
  setPhoneOverride: (phone: string) => void;
  maskedPhone: string;
  eventLogs: EventLogEntry[];
  addEventLog: (type: EventLogEntry['type'], message: string, payload?: any) => void;
  systemHealth: SystemHealth;
  systemConfig: {
    escalationSeconds: number;
    confidenceThreshold: number;
    language: 'bilingual' | 'hindi' | 'english';
    autoDispatchEnabled: boolean;
  };
  updateConfig: (newConfig: Partial<AppContextType['systemConfig']>) => void;
  callState: 'idle' | 'queued' | 'ringing' | 'answered' | 'completed' | 'failed';
  resetDemoData: () => void;
  isAudioMuted: boolean;
  toggleAudioMute: () => boolean;
}

const DEFAULT_OPERATOR: OperatorProfile = {
  id: 'OP112',
  name: 'Senior Controller OP112',
  role: 'Smart City Dispatcher',
  assignedSector: 'Sector 4 - Gurugram Express Corridor (NH-48)',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('netra_auth') === 'true';
  });

  const [operator] = useState<OperatorProfile>(DEFAULT_OPERATOR);
  
  // Item 6: Do not have pre-populated set active incidents initially
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  
  const [cameras] = useState<CameraInfo[]>(CAMERA_LIST);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-01');
  const [activeClip, setActiveClip] = useState<DemoClip>(INITIAL_DEMO_CLIPS[0]);
  const [phoneOverride, setPhoneOverride] = useState<string>('+91 9876543210');
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState<boolean>(false);
  const [activeEscalationIncident, setActiveEscalationIncident] = useState<Incident | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  const [callState, setCallState] = useState<'idle' | 'queued' | 'ringing' | 'answered' | 'completed' | 'failed'>('idle');

  const [systemConfig, setSystemConfig] = useState<{
    escalationSeconds: number;
    confidenceThreshold: number;
    language: 'bilingual' | 'hindi' | 'english';
    autoDispatchEnabled: boolean;
  }>({
    escalationSeconds: 15,
    confidenceThreshold: 0.85,
    language: 'bilingual',
    autoDispatchEnabled: true,
  });

  const [systemHealth] = useState<SystemHealth>({
    backend: true,
    model: true,
    twilio: true,
    fps: 29.8,
    latencyMs: 42,
    objectsDetected: 14,
  });

  const [eventLogs, setEventLogs] = useState<EventLogEntry[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), type: 'ws', message: 'WebSocket /ws/alerts connected [OK]' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), type: 'model', message: 'YOLOv8 CV inference stream connected [ONLINE]' },
    { id: '3', timestamp: new Date().toLocaleTimeString(), type: 'telephony', message: 'Twilio telephony trunk registered (+91 verified)' },
  ]);

  const presetIndexRef = useRef<number>(0);

  const addEventLog = useCallback((type: EventLogEntry['type'], message: string, payload?: any) => {
    const entry: EventLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      payload,
    };
    setEventLogs((prev) => [entry, ...prev.slice(0, 49)]);
  }, []);

  const login = (loginIdInput: string, passwordInput?: string) => {
    const id = loginIdInput.trim().toUpperCase();
    const pass = passwordInput ? passwordInput.trim() : '';

    if ((id === 'OP112' && pass === '12345') || id === 'DEMO-OPERATOR' || pass === '12345' || pass === 'operator112' || id === 'OP112') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('netra_auth', 'true');
      }
      addEventLog('action', `Operator OP112 authenticated successfully for ${DEFAULT_OPERATOR.assignedSector}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('netra_auth');
    }
    addEventLog('action', 'Operator signed out');
  };

  const maskedPhone = React.useMemo(() => {
    const cleaned = phoneOverride.replace(/\s+/g, '');
    if (cleaned.length >= 10) {
      const prefix = cleaned.substring(0, cleaned.length - 7);
      const suffix = cleaned.substring(cleaned.length - 2);
      return `${prefix}XXXXXX${suffix}`;
    }
    return phoneOverride;
  }, [phoneOverride]);

  const triggerTwilioDispatchCall = useCallback((inc: Incident) => {
    setCallState('queued');
    addEventLog('telephony', `Twilio API initiate call to ${maskedPhone}`, { incidentId: inc.id });

    setTimeout(() => {
      setCallState('ringing');
      addEventLog('telephony', `Twilio call status: RINGING on target trunk ${maskedPhone}`);
    }, 1500);

    setTimeout(() => {
      setCallState('answered');
      addEventLog('telephony', `Twilio call status: ANSWERED by First Responder (112 Control)`);

      const hindiText = `आपातकालीन चेतावनी! ${inc.location} पर भीषण सड़क दुर्घटना पाई गई है। तुरंत एम्बुलेंस भेजें।`;
      const englishText = `Emergency Alert! Collision detected at National Highway 48, Gurugram Express Corridor. Severe vehicle impact detected with high confidence. Immediate ambulance dispatch requested.`;
      soundManager.speakDispatchNotice(hindiText, englishText);
    }, 3800);

    setTimeout(() => {
      setCallState('completed');
      addEventLog('telephony', `Twilio call COMPLETED. Duration: 24 seconds. Incident ${inc.id} dispatched to 112 & 108.`);
      setIncidents((prev) =>
        prev.map((item) =>
          item.id === inc.id
            ? {
                ...item,
                status: 'DISPATCHED' as const,
                dispatchDetails: {
                  responder: '112 ERSS & 108 CATS Ambulance',
                  phone: maskedPhone,
                  callSid: 'CA' + Math.random().toString(36).substring(2, 12),
                  language: 'Bilingual Hindi/English',
                  callDuration: 24,
                  callStatus: 'completed',
                },
              }
            : item
        )
      );
    }, 8500);
  }, [addEventLog, maskedPhone]);

  // Second-by-second countdown for AWAITING incidents
  useEffect(() => {
    const timer = setInterval(() => {
      setIncidents((prevIncidents) =>
        prevIncidents.map((inc) => {
          if (inc.status === 'AWAITING' || inc.status === 'DETECTED') {
            const now = Date.now();
            const diffSec = Math.max(0, Math.ceil((inc.deadlineTs - now) / 1000));

            if (activeEscalationIncident?.id === inc.id) {
              setActiveEscalationIncident((current) =>
                current
                  ? {
                      ...current,
                      remainingSeconds: diffSec,
                      status: diffSec === 0 ? 'AUTO-ESCALATED' : current.status,
                    }
                  : null
              );
            }

            if (diffSec === 0 && (inc.status === 'AWAITING' || inc.status === 'DETECTED')) {
              triggerTwilioDispatchCall(inc);
              return {
                ...inc,
                remainingSeconds: 0,
                status: 'AUTO-ESCALATED' as const,
                timeline: [
                  ...inc.timeline,
                  {
                    time: new Date().toLocaleTimeString(),
                    title: '15s Timeout - Auto-Escalation Failsafe Triggered',
                    description: 'No operator response within deadline. Initiating Twilio Bilingual Voice Call.',
                    type: 'system',
                  },
                ],
              };
            }

            return { ...inc, remainingSeconds: diffSec };
          }
          return inc;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [activeEscalationIncident?.id, triggerTwilioDispatchCall]);

  const openEscalationModal = (incident: Incident) => {
    setActiveEscalationIncident(incident);
    setIsEscalationModalOpen(true);
  };

  const closeEscalationModal = () => {
    setIsEscalationModalOpen(false);
  };

  // Button 3a: Dismiss - AI false flagged and no accident occurred visibly
  const dismissIncident = (id: string) => {
    addEventLog('action', `Operator DISMISSED incident ${id} (AI False Flag)`);
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'DISMISSED',
              timeline: [
                ...inc.timeline,
                {
                  time: new Date().toLocaleTimeString(),
                  title: 'Operator Dismissed',
                  description: 'AI false flagged; verified no visible collision or hazard.',
                  type: 'dismissal',
                },
              ],
            }
          : inc
      )
    );
    if (activeEscalationIncident?.id === id) {
      setActiveEscalationIncident((prev) => (prev ? { ...prev, status: 'DISMISSED' } : null));
    }
    setIsEscalationModalOpen(false);
  };

  // Button 3b: Acknowledge - Incident occurred but no immediate dispatch needed
  const acknowledgeIncident = (id: string) => {
    addEventLog('action', `Operator ACKNOWLEDGED incident ${id}`);
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'ACKNOWLEDGED',
              timeline: [
                ...inc.timeline,
                {
                  time: new Date().toLocaleTimeString(),
                  title: 'Operator Acknowledged',
                  description: 'Incident verified manually by control room operator. No immediate dispatch needed.',
                  type: 'acknowledgement',
                },
              ],
            }
          : inc
      )
    );
    if (activeEscalationIncident?.id === id) {
      setActiveEscalationIncident((prev) => (prev ? { ...prev, status: 'ACKNOWLEDGED' } : null));
    }
  };

  // Button 3c: Dispatch - Dispatch emergency help
  const dispatchIncident = (id: string, responderType = '112 ERSS & 108 CATS Ambulance') => {
    addEventLog('action', `Operator DISPATCHED ${responderType} for incident ${id}`);
    const targetInc = incidents.find((i) => i.id === id);
    if (targetInc) {
      triggerTwilioDispatchCall(targetInc);
    }
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'DISPATCHED',
              timeline: [
                ...inc.timeline,
                {
                  time: new Date().toLocaleTimeString(),
                  title: `Dispatched to ${responderType}`,
                  description: `Emergency dispatch issued by operator to ${maskedPhone}.`,
                  type: 'dispatch',
                },
              ],
            }
          : inc
      )
    );
    if (activeEscalationIncident?.id === id) {
      setActiveEscalationIncident((prev) => (prev ? { ...prev, status: 'DISPATCHED' } : null));
    }
  };

  // Item 13: Use actual images of accidents with bounding boxes drawn around vehicles
  const triggerCollision = useCallback((customLocation?: string): Incident => {
    const idx = presetIndexRef.current % ACCIDENT_PRESETS.length;
    presetIndexRef.current += 1;
    const preset = ACCIDENT_PRESETS[idx];

    const newId = `INC-00${Math.floor(45 + Math.random() * 50)}`;
    const now = Date.now();
    const deadlineTs = now + systemConfig.escalationSeconds * 1000;

    const newIncident: Incident = {
      id: newId,
      cameraId: preset.cameraId,
      cameraName: preset.cameraName,
      location: customLocation || preset.location,
      coordinates: preset.coordinates,
      detectedAt: new Date().toISOString(),
      deadlineTs,
      remainingSeconds: systemConfig.escalationSeconds,
      severity: preset.severity,
      confidence: preset.confidence,
      status: 'AWAITING',
      vehicleType: preset.vehicleType,
      impactSpeed: preset.impactSpeed,
      snapshotUrl: preset.snapshotUrl, // User provided actual accident image with bounding boxes
      videoClipUrl: preset.videoClipUrl,
      boundingBoxes: [
        { x: 260, y: 150, width: 220, height: 140, label: preset.detectedVehicle, confidence: preset.confidence },
      ],
      timeline: [
        { time: new Date().toLocaleTimeString(), title: 'YOLOv8 Detection Triggered', description: `Camera ${preset.cameraId} detected ${preset.vehicleType}`, type: 'detection' },
        { time: new Date().toLocaleTimeString(), title: 'Alert Pushed via WebSocket', description: `/ws/alerts broadcasted to operator terminal OP112`, type: 'alert' },
        { time: new Date().toLocaleTimeString(), title: `${systemConfig.escalationSeconds}s Escalation Clock Initiated`, description: 'Server-authoritative timer started', type: 'system' },
      ],
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setActiveEscalationIncident(newIncident);
    setIsEscalationModalOpen(true);
    setCallState('idle');

    soundManager.playAlarmBeep();

    addEventLog('ws', `[WEBSOCKET] incident.created ${newId} (${(preset.confidence * 100).toFixed(0)}% conf)`);
    addEventLog('model', `YOLOv8 real bounding box detection on ${newIncident.cameraName}`);

    return newIncident;
  }, [addEventLog, systemConfig.escalationSeconds]);



  const updateConfig = (newConfig: Partial<AppContextType['systemConfig']>) => {
    setSystemConfig((prev) => ({ ...prev, ...newConfig }));
    addEventLog('action', `Updated escalation config: ${JSON.stringify(newConfig)}`);
  };

  const resetDemoData = () => {
    setIncidents([]);
    setActiveEscalationIncident(null);
    setIsEscalationModalOpen(false);
    setCallState('idle');
    addEventLog('action', 'Demo dataset cleared to zero active incidents');
  };

  const toggleAudioMute = () => {
    const isMuted = soundManager.toggleMute();
    setIsAudioMuted(isMuted);
    return isMuted;
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        operator,
        login,
        logout,
        incidents,
        activeEscalationIncident,
        isEscalationModalOpen,
        openEscalationModal,
        closeEscalationModal,
        dismissIncident,
        acknowledgeIncident,
        dispatchIncident,
        triggerCollision,
        activeClip,
        setActiveClip,
        cameras,
        selectedCameraId,
        setSelectedCameraId,
        phoneOverride,
        setPhoneOverride,
        maskedPhone,
        eventLogs,
        addEventLog,
        systemHealth,
        systemConfig,
        updateConfig,
        callState,
        resetDemoData,
        isAudioMuted,
        toggleAudioMute,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
