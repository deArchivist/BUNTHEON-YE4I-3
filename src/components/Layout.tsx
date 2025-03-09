import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import { AppShell, Container } from '@mantine/core';
import BottomNavigation from './navigation/BottomNavigation';
import { getLayerBackground, getShadow } from '../theme/mantineTheme';

const Layout: React.FC = () => {
  const { themeParams, webApp, setSwipeBehavior } = useTelegram();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle back button
  useEffect(() => {
    if (!webApp) return;

    // Show back button only if not on home page
    if (location.pathname !== '/') {
      // Configure the back button
      webApp.BackButton.onClick(() => navigate(-1));
      webApp.BackButton.show();
      
      // Disable vertical swipe on content pages to prevent accidental exits
      setSwipeBehavior(false);
    } else {
      // Hide back button on home page
      webApp.BackButton.hide();
      
      // Enable vertical swipe on home page for easier app exit
      setSwipeBehavior(true);
    }

    // Cleanup function
    return () => {
      if (webApp) {
        webApp.BackButton.offClick(() => navigate(-1));
      }
    };
  }, [location.pathname, webApp, navigate, setSwipeBehavior]);

  // Apply Telegram theme colors
  useEffect(() => {
    if (themeParams) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
      document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color);
      document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color);
      document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color);
      document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color);
      document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
    }
  }, [themeParams]);

  return (
    <AppShell
      padding="md"
      footer={{ height: 60 }}
      style={{
        background: 'linear-gradient(135deg, rgba(245, 247, 255, 0.5), rgba(255, 255, 255, 0.8))',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppShell.Main
        style={{
          height: 'calc(100vh - 60px)',
          overflowY: 'auto',
          paddingBottom: '70px', // Space for bottom nav
          backgroundColor: getLayerBackground('base'),
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', // For Safari
          borderRadius: '1rem 1rem 0 0',
          boxShadow: getShadow('xs'),
        }}
      >
        <Container size="md" pt={16} pb={16}>
          <Outlet />
        </Container>
      </AppShell.Main>
      
      <AppShell.Footer
        p={0}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', // For Safari
          boxShadow: `0 -4px 10px rgba(0, 0, 0, 0.04)`,
          zIndex: 1000,
        }}
      >
        <BottomNavigation />
      </AppShell.Footer>
    </AppShell>
  );
};

export default Layout;