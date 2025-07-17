import Constants from 'expo-constants';
import { OPENAI_API_KEY } from '@env';

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      "nativewind/babel",
      ["babel-plugin-styled-components", { "ssr": false }],
      ["module:react-native-dotenv"]
    ]
  };
};
