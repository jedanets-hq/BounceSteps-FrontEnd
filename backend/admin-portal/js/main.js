/**
 * iSafari Admin Portal - Main Entry Point
 */

import { AdminApp } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new AdminApp();
    app.init();
});
