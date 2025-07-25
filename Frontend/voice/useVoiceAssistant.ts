import * as Speech from 'expo-speech';

export const speak = (text: string) => {
  Speech.speak(text, { voice: 'en-US' });
}; 