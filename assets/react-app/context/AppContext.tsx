// frontend/src/context/AppContext.tsx
import React, { createContext, useState, ReactNode } from "react";

interface Unite {
  id: string,
  lat: string,
  lng: string,
  label: string
}

interface AppContextType {
  unites: Unite[];
  setUnites: (unites: Unite[]) => void;
  // posts: Post[];
  // setPosts: (posts: Post[]) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [unites, setUnites] = useState<Unite[]>([]);
  // const [posts, setPosts] = useState<Post[]>([]);
  return (
    <AppContext.Provider
      value={{
        unites,
        setUnites
      }
      }
    >
      {children}
    </AppContext.Provider>
  );
};
