import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { speak } from '../../voice/useVoiceAssistant';

export default function JarvisBot() {
  const [message, setMessage] = useState('How can I help you today?');

  const handleCommand = (text: string) => {
    setMessage(`You said: ${text}`);
    speak(`You said: ${text}`);
  };

  return (
    <View>
      {/* VoiceInput component to be implemented */}
      <Text>{message}</Text>
      <Button title="Ask Jarvis" onPress={() => speak(message)} />
    </View>
  );
} 