import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  };
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  setSwipeConfig: (config: { allow_vertical_swipe: boolean }) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  } | null;
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  } | null;
  setSwipeBehavior: (allow: boolean) => void;
}

// Fix: Create context with proper default values including a valid function for setSwipeBehavior
const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  themeParams: null,
  setSwipeBehavior: () => {}, // Empty function as a placeholder
});

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramContextType['user']>(null);
  const [themeParams, setThemeParams] = useState<TelegramContextType['themeParams']>(null);

  // Define the setSwipeBehavior function
  const setSwipeBehavior = (allow: boolean) => {
    if (webApp) {
      try {
        webApp.setSwipeConfig({ allow_vertical_swipe: allow });
        console.log(`Vertical swipe ${allow ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error("Error setting swipe behavior:", error);
        console.warn("Your Telegram client may not support setSwipeConfig (requires v7.7+)");
      }
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
      setThemeParams(tg.themeParams);

      try {
        tg.setSwipeConfig({ allow_vertical_swipe: true });
      } catch (error) {
        console.warn("setSwipeConfig not supported in this Telegram client version (requires v7.7+)");
      }
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, user, themeParams, setSwipeBehavior }}>
      {children}
    </TelegramContext.Provider>
  );
};