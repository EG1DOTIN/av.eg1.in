import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'eg-web-core/style.css';
import './index.css';
import { DataCache, FirebaseProvider } from 'eg-web-core';
import { AV_FIREBASE_CONFIG } from './config/firebase';

// Register application-specific cache and storage prefix
DataCache.registerStoragePrefix('av_');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseProvider config={AV_FIREBASE_CONFIG} appName="av.eg1.in">
      <App />
    </FirebaseProvider>
  </React.StrictMode>
);
