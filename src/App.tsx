import { useState, useEffect } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { NewSessionScreen } from "./components/NewSessionScreen";
import { CuppingScreen } from "./components/CuppingScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { Toaster } from "./components/ui/sonner";

type Screen = "home" | "new-session" | "cupping" | "summary";

interface CupScore {
  cupTitle: string;
  fragrance: number;
  flavor: number;
  aftertaste: number;
  acidity: number;
  body: number;
  balance: number;
  overall: number;
  uniformity: number;
  cleanCup: number;
  sweetness: number;
  defectType: string;
  defectCount: number;
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
        setSessions(JSON.parse(stored));
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
    fragrance: 6.0,
    flavor: 6.0,
    aftertaste: 6.0,
    acidity: 6.0,
    body: 6.0,
    balance: 6.0,
    overall: 6.0,
    uniformity: 10,
    cleanCup: 10,
    sweetness: 10,
    defectType: "none",
    defectCount: 0,
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
