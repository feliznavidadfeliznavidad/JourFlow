// components/FontLoader.tsx
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
      await Font.loadAsync(fonts); // Tải tất cả các font từ file fonts.ts
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Hoặc bạn có thể hiển thị một loading spinner
  }

  return <>{children}</>; // Trả về children khi fonts đã được tải
};

export default FontLoader;
