import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./i18n/config"; // ✅ Initialize i18n

import { Provider } from "react-redux";
import { store } from "./store/store";

import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AppThemeProvider } from "./theme/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AppThemeProvider>
    </Provider>
  </React.StrictMode>
);
