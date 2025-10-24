import { useState, useEffect } from 'react';

const FIRST_LAUNCH_KEY = 'sca-cupping-app-first-launch';

export function useFirstLaunch() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasLaunchedBefore = localStorage.getItem(FIRST_LAUNCH_KEY);
    
    if (!hasLaunchedBefore) {
      setIsFirstLaunch(true);
    }
    
    setIsLoading(false);
  }, []);

  const markAsLaunched = () => {
    localStorage.setItem(FIRST_LAUNCH_KEY, 'true');
    setIsFirstLaunch(false);
  };

  return {
    isFirstLaunch,
    isLoading,
    markAsLaunched,
  };
}
