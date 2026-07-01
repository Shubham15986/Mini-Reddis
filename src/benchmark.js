const net = require('net');

const client = new net.Socket();
const TOTAL_OPS = 50000;
let opsCompleted = 0;
const startTime = Date.now();

client.connect(6380, '127.0.0.1', () => {
  console.log(`Starting benchmark: ${TOTAL_OPS} SET operations...`);
  
  // Batch all commands into a single payload to avoid overwhelming the socket with 50,000 individual writes
  let payload = '';
  for (let i = 0; i < TOTAL_OPS; i++) {
    payload += `SET bench:${i} load_test_value\n`;
  }
  
  client.write(payload);
});

client.on('data', (data) => {
  const str = data.toString();
  const okCount = (str.match(/OK/g) || []).length;
  opsCompleted += okCount;

  if (opsCompleted >= TOTAL_OPS) {
    const duration = (Date.now() - startTime) / 1000; // in seconds
    const opsPerSec = Math.round(TOTAL_OPS / duration);
    console.log(`Completed in ${duration}s`);
    console.log(`Throughput: ${opsPerSec} Ops/Sec`);
    client.destroy();
    process.exit(0);
  }
});
