import React, { type PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";

// Import reducers
import authReducer from "../store/slices/authSlice";
import bidReducer from "../store/slices/bidSlice";
import jobsReducer from "../store/slices/jobsSlice";
import verificationReducer from "../store/slices/mechanicSlice";

// Import RootState type
import type { RootState } from "../store/store";

// ✅ Fix: Create rootReducer first to help TypeScript inference
const rootReducer = combineReducers({
  auth: authReducer,
  bids: bidReducer,
  jobs: jobsReducer,
  mechanic: verificationReducer,
});

// ✅ STEP 1: Setup Store Helper
export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

export type AppStore = ReturnType<typeof setupStore>;

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // ✅ STEP 2: Use helper
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren): React.ReactElement {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
