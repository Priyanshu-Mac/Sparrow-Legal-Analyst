import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing');

  const showChat = () => {
    setCurrentView('chat');
  };

  const showLanding = () => {
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {currentView === 'landing' && (
        <Navbar 
          onGetStarted={showChat} 
          currentView={currentView}
        />
      )}
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <LandingPage onGetStarted={showChat} />
            </motion.div>
          )}
          {currentView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="h-screen"
            >
              <ChatInterface onBack={showLanding} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {currentView === 'landing' && <Footer />}
    </div>
  );
}