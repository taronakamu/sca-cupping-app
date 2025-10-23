import { useState, useEffect } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { NewSessionScreen } from "./components/NewSessionScreen";
import { CuppingScreen } from "./components/CuppingScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { Toaster } from "./components/ui/sonner";

type Screen = "home" | "new-session" | "cupping" | "summary";

interface CupScore {
  cupTitle: string;
  roastLevel: number; // 1-5 (Light to Dark)
  // Fragrance/Aroma (first evaluation)
  fragrance: number; // 0.00-10.00
  aromaDryIntensity: number; // 1-5
  aromaBreakIntensity: number; // 1-5
  aromaQualities: string; // Combined dry + break
  // Taste attributes
  flavor: number;
  flavorNotes: string;
  aftertaste: number;
  aftertasteNotes: string;
  acidity: number;
  acidityIntensity: number; // 1-5
  body: number;
  bodyLevel: number; // 1-5
  balance: number;
  // Consistency (mark problematic cups individually)
  uniformityIssues: boolean[]; // 5 cups
  cleanCupIssues: boolean[]; // 5 cups
  sweetnessIssues: boolean[]; // 5 cups
  // Final impression
  overall: number;
  // Defects
  taintCups: number;
  faultCups: number;
  // General notes
  notes: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  isComplete: boolean;
  numCups: number;
  sessionNotes: string;
  cupScores: CupScore[];
}

const STORAGE_KEY = "sca-cupping-sessions";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSessions = JSON.parse(stored);
        // Migrate old sessions to new format
        const migratedSessions = parsedSessions.map((session: Session) => ({
          ...session,
          cupScores: session.cupScores.map((cup: any) => {
            // If old format, migrate to new format
            if ('defectType' in cup && !('taintCups' in cup)) {
              const taintCups = cup.defectType === 'taint' ? (cup.defectCount || 0) : 0;
              const faultCups = cup.defectType === 'fault' ? (cup.defectCount || 0) : 0;
              
              // Migrate old uniformity/cleanCup/sweetness scores to issue arrays
              const uniformityIssues = cup.uniformity ? 
                Array(5).fill(false).map((_, i) => i < (5 - Math.floor(cup.uniformity / 2))) : 
                [false, false, false, false, false];
              const cleanCupIssues = cup.cleanCup ? 
                Array(5).fill(false).map((_, i) => i < (5 - Math.floor(cup.cleanCup / 2))) : 
                [false, false, false, false, false];
              const sweetnessIssues = cup.sweetness ? 
                Array(5).fill(false).map((_, i) => i < (5 - Math.floor(cup.sweetness / 2))) : 
                [false, false, false, false, false];
              
              return {
                ...cup,
                roastLevel: cup.roastLevel ?? 3,
                aromaDryIntensity: cup.aromaDryIntensity ?? 3,
                aromaBreakIntensity: cup.aromaBreakIntensity ?? 3,
                aromaQualities: cup.aromaDryQualities || cup.aromaBreakQualities || "",
                flavorNotes: "",
                aftertasteNotes: "",
                acidityIntensity: cup.acidityIntensity ?? 3,
                bodyLevel: cup.bodyLevel ?? 3,
                uniformityIssues,
                cleanCupIssues,
                sweetnessIssues,
                taintCups,
                faultCups,
              };
            }
            // Already new format, but ensure all fields exist
            return {
              roastLevel: 3,
              aromaDryIntensity: 3,
              aromaBreakIntensity: 3,
              aromaQualities: "",
              flavorNotes: "",
              aftertasteNotes: "",
              acidityIntensity: 3,
              bodyLevel: 3,
              uniformityIssues: [false, false, false, false, false],
              cleanCupIssues: [false, false, false, false, false],
              sweetnessIssues: [false, false, false, false, false],
              taintCups: 0,
              faultCups: 0,
              ...cup,
            };
          }),
        }));
        setSessions(migratedSessions);
      } catch (e) {
        console.error("Failed to parse sessions from localStorage", e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const createDefaultCupScore = (): CupScore => ({
    cupTitle: "",
    roastLevel: 3, // Medium by default
    // Fragrance/Aroma
    fragrance: 6.0,
    aromaDryIntensity: 3,
    aromaBreakIntensity: 3,
    aromaQualities: "",
    // Taste attributes
    flavor: 6.0,
    flavorNotes: "",
    aftertaste: 6.0,
    aftertasteNotes: "",
    acidity: 6.0,
    acidityIntensity: 3,
    body: 6.0,
    bodyLevel: 3,
    balance: 6.0,
    // Consistency (no issues by default)
    uniformityIssues: [false, false, false, false, false],
    cleanCupIssues: [false, false, false, false, false],
    sweetnessIssues: [false, false, false, false, false],
    // Final impression
    overall: 6.0,
    // Defects
    taintCups: 0,
    faultCups: 0,
    // General notes
    notes: "",
  });

  const handleNewSession = () => {
    setScreen("new-session");
  };

  const handleStartSession = (title: string, numCups: number, notes: string) => {
    const newSession: Session = {
      id: Date.now().toString(),
      title,
      date: new Date().toISOString(),
      isComplete: false,
      numCups,
      sessionNotes: notes,
      cupScores: Array.from({ length: numCups }, () => createDefaultCupScore()),
    };

    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setScreen("cupping");
  };

  const handleResumeSession = (id: string) => {
    setCurrentSessionId(id);
    setScreen("cupping");
  };

  const handleViewSummary = (id: string) => {
    setCurrentSessionId(id);
    setScreen("summary");
  };

  const handleUpdateCup = (cupIndex: number, scores: CupScore) => {
    if (!currentSessionId) return;

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId) {
          const newCupScores = [...session.cupScores];
          newCupScores[cupIndex] = scores;
          return { ...session, cupScores: newCupScores };
        }
        return session;
      })
    );
  };

  const handleFinishSession = () => {
    if (!currentSessionId) return;

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? { ...session, isComplete: true }
          : session
      )
    );

    setScreen("summary");
  };

  const handleBackToHome = () => {
    setCurrentSessionId(null);
    setScreen("home");
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setScreen("home");
    }
  };

  const handleUpdateSession = (
    id: string,
    updates: { title: string; numCups: number; sessionNotes: string }
  ) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === id) {
          const currentCups = session.cupScores.length;
          const newNumCups = updates.numCups;
          let newCupScores = [...session.cupScores];

          // If increasing cups, add new default cups
          if (newNumCups > currentCups) {
            const additionalCups = Array.from(
              { length: newNumCups - currentCups },
              () => createDefaultCupScore()
            );
            newCupScores = [...newCupScores, ...additionalCups];
          }
          // If decreasing cups, trim the array
          else if (newNumCups < currentCups) {
            newCupScores = newCupScores.slice(0, newNumCups);
          }

          return {
            ...session,
            title: updates.title,
            numCups: updates.numCups,
            sessionNotes: updates.sessionNotes,
            cupScores: newCupScores,
          };
        }
        return session;
      })
    );
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="min-h-screen">
      {screen === "home" && (
        <HomeScreen
          sessions={sessions}
          onNewSession={handleNewSession}
          onResumeSession={handleResumeSession}
          onViewSummary={handleViewSummary}
          onDeleteSession={handleDeleteSession}
          onUpdateSession={handleUpdateSession}
        />
      )}

      {screen === "new-session" && (
        <NewSessionScreen
          onBack={handleBackToHome}
          onStartSession={handleStartSession}
        />
      )}

      {screen === "cupping" && currentSession && (
        <CuppingScreen
          sessionTitle={currentSession.title}
          numCups={currentSession.numCups}
          cupScores={currentSession.cupScores}
          onBack={handleBackToHome}
          onUpdateCup={handleUpdateCup}
          onFinish={handleFinishSession}
        />
      )}

      {screen === "summary" && currentSession && (
        <SummaryScreen
          session={currentSession}
          onBack={handleBackToHome}
          onDeleteSession={handleDeleteSession}
          onUpdateSession={handleUpdateSession}
        />
      )}

      <Toaster />
    </div>
  );
}

export default App;
