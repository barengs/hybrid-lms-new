import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { PlatformProvider } from './context/PlatformContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <PlatformProvider>
          <App />
        </PlatformProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
