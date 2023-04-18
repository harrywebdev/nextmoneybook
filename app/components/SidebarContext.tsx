import React, { createContext, ReactNode, useContext, useState } from "react";

// Define the type for our context
type SidebarContextType = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

// Create the context
const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggleSidebar: () => {},
});

// Create a provider component that wraps our app
export const SidebarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Define a function to toggle the sidebar
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Create a hook to access the context
export const useSidebar = () => useContext(SidebarContext);
