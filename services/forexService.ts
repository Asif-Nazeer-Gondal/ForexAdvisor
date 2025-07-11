export const fetchUSDtoPKR = async (): Promise<number> => {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=PKR');
    const data = await res.json();
    if (data.success && data.rates?.PKR) {
      return data.rates.PKR;
    } else {
      throw new Error("Invalid response from API");
    }
  } catch (err) {
    console.error("Error fetching Forex rate:", err);
    throw err;
  }
};
