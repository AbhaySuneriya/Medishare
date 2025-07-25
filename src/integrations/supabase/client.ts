// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xewjuqxywcnddfpeqcbw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhld2p1cXh5d2NuZGRmcGVxY2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MzAwNDAsImV4cCI6MjA1ODMwNjA0MH0.mBw5HVsPNFBYfQ9OlrGg0Rj--C_jF81IZLSwzg_Yv2A";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Function to check if dark mode is enabled
export const isDarkMode = () => {
  return localStorage.getItem('color-theme') === 'dark' || 
    (!localStorage.getItem('color-theme') && 
     window.matchMedia('(prefers-color-scheme: dark)').matches);
};

// Function to toggle dark mode
export const toggleDarkMode = () => {
  if (isDarkMode()) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('color-theme', 'light');
    return 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('color-theme', 'dark');
    return 'dark';
  }
};

// Function to initialize theme based on user preference
export const initializeTheme = () => {
  // If theme is already set in localStorage, use that
  if (localStorage.getItem('color-theme')) {
    if (localStorage.getItem('color-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } 
  // Otherwise check the system preference
  else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
    }
  }
};
