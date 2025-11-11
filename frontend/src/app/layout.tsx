'use client';

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { OnboardProvider } from '@/contexts/OnboardContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Arc Cross-Border Payments - Fast, secure, and transparent remittances" />
        <meta name="theme-color" content="#6495ff" />
        <title>Arc Cross-Border Payments</title>
      </head>
      <body suppressHydrationWarning>
        <OnboardProvider>
          {children}
        </OnboardProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
