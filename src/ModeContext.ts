
import { createContext } from 'react';

const ModeContext = createContext<{
  currentMode: string;
  setCurrentMode: React.Dispatch<React.SetStateAction<string>>;
}>({
  currentMode: 'mode1',
  setCurrentMode: () => {},
});

export default ModeContext;
