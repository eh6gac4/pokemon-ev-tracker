import React from 'react';
import { createRoot } from 'react-dom/client';
import EVTracker from '../js/tracker.jsx';
import '../style.css';
import { registerSW } from './sw-register.js';

createRoot(document.getElementById("root")).render(<EVTracker />);

registerSW();
