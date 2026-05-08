/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider } from './lib/AuthContext';
import { Toaster } from 'react-hot-toast';
import { FestiFlowApp } from './components/FestiFlowApp';

export default function App() {
  return (
    <AuthProvider>
      <FestiFlowApp />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

