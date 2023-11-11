import React, { useState } from 'react';
import SplashScreen from '../screens/SplashScreen';
import Navigation from '../Navigation';
import FontError from './FontError';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(null);

  const handleFontsLoaded = error => {
    if (error) {
      setFontError(error);
    } else {
      setFontsLoaded(true);
    }
  };

  if (fontError) {
    return <FontError message={fontError.message} />;
  }

  return fontsLoaded ? <Navigation /> : <SplashScreen onFontsLoaded={handleFontsLoaded} />;
}