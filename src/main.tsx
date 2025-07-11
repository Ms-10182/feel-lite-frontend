import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, ToastBar } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'
import toast, { Toast } from 'react-hot-toast'

function CustomToast({ t, message }: { t: Toast, message: string }) {
  return (
    <div
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer', outline: 'none' }}
      onClick={() => toast.dismiss(t.id)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toast.dismiss(t.id)}
    >
      {message}
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false
        return failureCount < 3
      },
    },
    mutations: {
      retry: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 1500,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                },
                success: {
                  iconTheme: {
                    primary: '#22C55E',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            >
              {(t) => (
                <div
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  onClick={() => toast.dismiss(t.id)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toast.dismiss(t.id)}
                >
                  <ToastBar toast={t} />
                </div>
              )}
            </Toaster>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)