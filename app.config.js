import 'dotenv/config';

export default {
  expo: {
    name: "ForexAdvisor",
    slug: "forexadvisor",
    version: "1.0.0",
    extra: {
      TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY,
      EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY,
      CURRENCY_API_KEY: process.env.CURRENCY_API_KEY,
    },
  },
};
