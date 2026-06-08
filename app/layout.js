import './globals.css';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Alliance Quiz AI — Professional Assessment Platform',
  description: 'AI-powered proctored quiz assessment platform with detailed performance reports.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#000000',
                color: '#FFFDF2',
                borderRadius: '0',
                border: '2px solid #000',
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#000' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#000' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
