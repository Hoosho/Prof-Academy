// utils/getDeviceId.util.js
(async () => {
    const fp = await import('https://openfpcdn.io/fingerprintjs/v3');
    const fpInstance = await fp.load();
    const result = await fpInstance.get();
  
    console.log('🧠 Device Fingerprint Result:');
    console.log('visitorId:', result.visitorId);
    console.log('confidence:', result.confidence);
    console.log('components:', result.components);
  })();
  