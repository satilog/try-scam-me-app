import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { Step, steps } from "@/components/Steps";

export const defaultStep: Step = steps[0];

interface UserDetails {
  name: string;
  email: string;
  address: string;
  rate: number;
  verified: boolean;
  moderation_status: string;
  coordinates: number[];
}

interface SetupData {
  _id?: string;
  user_details?: UserDetails;
}

type AppContextType = {
  userId: string | null;
  setUserId: Dispatch<SetStateAction<string | null>>;
  userEmail: string | null;
  setUserEmail: Dispatch<SetStateAction<string | null>>;
  currentStep: Step;
  updateCurrentStep: (step: Step) => void;
  setupData: SetupData;
  updateSetupData: (data: Partial<SetupData>) => void;
};

const defaultState: AppContextType = {
  userId: null,
  setUserId: () => {},
  userEmail: null,
  setUserEmail: () => {},
  currentStep: defaultStep,
  updateCurrentStep: () => {},
  setupData: {},
  updateSetupData: () => {},
};

const AppContext = createContext<AppContextType>(defaultState);

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(defaultStep);
  const [setupData, setSetupData] = useState<SetupData>({});

  const updateCurrentStep = (step: Step) => {
    setCurrentStep(step);
  };

  const updateSetupData = (data: Partial<SetupData>) => {
    setSetupData(prev => ({ ...prev, ...data }));
  };

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        userEmail,
        setUserEmail,
        currentStep,
        updateCurrentStep,
        setupData,
        updateSetupData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
