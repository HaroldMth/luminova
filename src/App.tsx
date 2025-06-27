import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { GiveawayPage } from './pages/GiveawayPage';
import { ReferralPage } from './pages/ReferralPage';
import { WinnerPage } from './pages/WinnerPage';
import { BrowsePage } from './pages/BrowsePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminPage } from './pages/AdminPage';
import { ADMIN_SECRET_PATH } from './utils/constants';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/giveaway/:id" element={<GiveawayPage />} />
          <Route path="/g/:giveawayId" element={<ReferralPage />} />
          <Route path="/winner/:giveawayId" element={<WinnerPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path={`/${ADMIN_SECRET_PATH}`} element={<AdminPage />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white shadow-lg',
          style: {
            background: '#fff',
            color: '#333',
          },
        }}
      />
    </Router>
  );
}

export default App;