import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from './store'
import { router } from './router'
import './index.css'

import { LanguageProvider } from '@/contexts/LanguageContext'
import { ProfileProvider } from '@/contexts/ProfileContext'
import AuthSync from '@/components/AuthSync'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ProfileProvider>
        <Provider store={store}>
          <AuthSync />
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </Provider>
      </ProfileProvider>
    </LanguageProvider>
  </StrictMode>,
)
