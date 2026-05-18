/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import LinktreePage from './components/LinktreePage';
import AdminPage from './components/AdminPage';

export default function App() {
  useEffect(() => {
    const initSettings = async () => {
      const settingsDoc = doc(db, 'settings', 'global');
      const docSnap = await getDoc(settingsDoc);
      if (!docSnap.exists()) {
        await setDoc(settingsDoc, {
          centerName: "مركز آتاها التعليمي التربوي",
          socialMedia: [
            { platform: 'Facebook', url: 'https://facebook.com' },
            { platform: 'Instagram', url: 'https://instagram.com' }
          ]
        });
      }
    };
    initSettings();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LinktreePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
