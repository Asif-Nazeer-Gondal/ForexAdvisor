// File: scripts/cleanCache.ts
import { exec } from 'child_process';

exec('expo r -c', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error clearing cache: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`⚠️ stderr: ${stderr}`);
    return;
  }
  console.log(`✅ Cache cleared:
${stdout}`);
});