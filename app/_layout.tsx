import '../global.css';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../theme/ThemeContext';
import { LanguageProvider } from '../theme/LanguageContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </LanguageProvider>
  );
}
