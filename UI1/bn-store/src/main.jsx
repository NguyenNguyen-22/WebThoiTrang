import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'
import { CartProvider } from './CartContext.jsx'
import { LanguageProvider } from './LanguageContext.jsx'

// Hãy thay đổi 'YOUR_GOOGLE_CLIENT_ID' thành Google Client ID thật của bạn trong Google Cloud Console.
const CLIENT_ID = "520254813119-u0r8p7l4eligv6v4t3iov7ro3hggvi05.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <LanguageProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
