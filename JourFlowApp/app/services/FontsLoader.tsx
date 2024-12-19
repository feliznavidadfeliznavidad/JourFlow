import React, { useState, useEffect, ReactNode } from "react";
import * as Font from "expo-font";
import fonts from "../../assets/fonts/Kalamfont/fonts";

interface FontLoaderProps {
  children: ReactNode;
}

const FontLoader: React.FC<FontLoaderProps> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync(fonts); 
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
};

export default FontLoader;
