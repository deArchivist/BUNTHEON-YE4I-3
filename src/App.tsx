import React, { StrictMode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { TelegramProvider } from './contexts/TelegramContext';
import { ChatProvider } from './contexts/ChatContext';
import { RemindersProvider } from './contexts/RemindersContext';
import { PomodoroProvider } from './contexts/PomodoroContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AIChat from './pages/AIChat';
import PromptLibrary from './pages/PromptLibrary';
import Dictionary from './pages/Dictionary';
import ExamPapers from './pages/ExamPapers';
import RemindersWithContext from './pages/RemindersWithContext';
import Pomodoro from './pages/Pomodoro';
import Resources from './pages/Resources';
import { theme } from './theme/mantineTheme';

// Import global styles
import './styles/global.css';

function App() {
  return (
    <StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Router>
          <TelegramProvider>
            <ChatProvider>
              <RemindersProvider>
                <PomodoroProvider>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="ai-chat" element={<AIChat />} />
                      <Route path="prompts" element={<PromptLibrary />} />
                      <Route path="dictionary" element={<Dictionary />} />
                      <Route path="exam-papers" element={<ExamPapers />} />
                      <Route path="resources" element={<Resources />} />
                      <Route path="reminders" element={<RemindersWithContext />} />
                      <Route path="pomodoro" element={<Pomodoro />} />
                    </Route>
                  </Routes>
                </PomodoroProvider>
              </RemindersProvider>
            </ChatProvider>
          </TelegramProvider>
        </Router>
      </MantineProvider>
    </StrictMode>
  );
}

export default App;