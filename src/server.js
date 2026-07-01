const net = require('net');
const fs = require('fs');
const HashTable = require('./structures/HashTable');
const { DLLNode, DoublyLinkedList } = require('./structures/DoublyLinkedList');
const LRUCache = require('./structures/LRUCache');
const SkipList = require('./structures/SkipList');
const MinHeap = require('./structures/MinHeap');

// Core stores
const kvStore = new HashTable();
const lists = new Map(); // Key -> DoublyLinkedList
const sortedSets = new Map(); // Key -> SkipList
const cache = new LRUCache(3); // Max 3 items for testing
const expiryHeap = new MinHeap();

// Startup Persistence Loading
if (fs.existsSync('dump.rdb.json')) {
  try {
    const data = fs.readFileSync('dump.rdb.json', 'utf8');
    const snapshot = JSON.parse(data);
    for (const [key, value] of Object.entries(snapshot)) {
      kvStore.set(key, value);
    }
    console.log(`[Persistence] Loaded ${Object.keys(snapshot).length} keys from disk.`);
  } catch (err) {
    console.error('[Persistence] Error loading snapshot:', err.message);
  }
}

// Simple Persistence: Save state every 60 seconds
setInterval(() => {
  const snapshot = {};
  for (const bucket of kvStore.buckets) {
    for (const [key, value] of bucket) {
      snapshot[key] = value;
    }
  }
  fs.writeFileSync('dump.rdb.json', JSON.stringify(snapshot));
  console.log('[Persistence] Snapshot saved to disk.');
}, 60000);

// Background Expiry Loop (Proactive Eviction)
setInterval(() => {
  const now = Date.now();
  let root = expiryHeap.peek();
  while (root && root.expiresAt <= now) {
    kvStore.delete(root.key); // Delete from Hash Table
    expiryHeap.pop();         // Remove from Heap
    console.log(`[Expiry] Evicted key: ${root.key}`);
    root = expiryHeap.peek();
  }
}, 1000); // Check every second

const handleCommand = (commandStr) => {
  const args = commandStr.trim().split(/\s+/);
  if (args.length === 0 || !args[0]) return '';

  const cmd = args[0].toUpperCase();
  const key = args[1];

  switch (cmd) {
    // --- STRING & EXPIRY ---
    case 'SET':
      kvStore.set(key, args[2]);
      return 'OK';
    case 'GET':
      // Lazy expiry check
      const val = kvStore.get(key);
      return val !== null ? `"${val}"` : '(nil)';
    case 'EXPIRE':
      const ttl = parseInt(args[2], 10);
      expiryHeap.push(key, Date.now() + (ttl * 1000));
      return '(integer) 1';

    // --- LIST COMMANDS ---
    case 'LPUSH':
      if (!lists.has(key)) lists.set(key, new DoublyLinkedList());
      lists.get(key).pushFront(new DLLNode(args[2]));
      return `(integer) ${lists.get(key).size}`;
    case 'RPOP':
      if (!lists.has(key) || lists.get(key).size === 0) return '(nil)';
      return `"${lists.get(key).popBack().value}"`;

    // --- LRU CACHE COMMANDS ---
    case 'CACHESET':
      cache.set(key, args[2]);
      return 'OK';
    case 'CACHEGET':
      const cached = cache.get(key);
      return cached !== null ? `"${cached}"` : '(nil)';

    // --- SORTED SET COMMANDS ---
    case 'ZADD':
      if (!sortedSets.has(key)) sortedSets.set(key, new SkipList());
      const score = parseFloat(args[2]);
      const member = args[3];
      sortedSets.get(key).insert(member, score);
      return '(integer) 1';
    case 'ZRANGE':
      if (!sortedSets.has(key)) return '(empty array)';
      const start = parseInt(args[2], 10);
      const end = parseInt(args[3], 10);
      const range = sortedSets.get(key).range(start, end);
      return range.length ? range.join('\n') : '(empty array)';

    // --- EXISTING COMMANDS ---
    case 'DEL':
      if (args.length < 2) return '(error) ERR wrong number of arguments for DEL';
      const deleted = kvStore.delete(key);
      return deleted ? '(integer) 1' : '(integer) 0';
      
    case 'PING':
      return 'PONG';

    default:
      return `(error) ERR unknown command '${cmd}'`;
  }
};

const server = net.createServer((socket) => {
  socket.write("Connected to Mini Redis\r\n> ");
  let buffer = '';
  socket.on('data', (data) => {
    buffer += data.toString();
    const commands = buffer.split('\n');
    buffer = commands.pop(); // Keep the incomplete part in the buffer
    let responses = [];
    for (let cmd of commands) {
      if (!cmd.trim()) continue;
      const res = handleCommand(cmd);
      if (res) responses.push(res);
    }
    if (responses.length > 0) {
      socket.write(responses.join('\r\n> ') + '\r\n> ');
    }
  });
  socket.on('error', (err) => {
    console.error('Client disconnected or error:', err.message);
  });
});

const PORT = 6380;
server.listen(PORT, () => {
  console.log(`Mini Redis core listening on port ${PORT}`);
});
