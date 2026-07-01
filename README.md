# Mini Redis

A lightweight, high-performance, in-memory key-value database built from scratch in Node.js. 

This project is a custom implementation of Redis-like functionality, completely bypassing standard HTTP to use raw TCP sockets. It demonstrates a deep understanding of low-level network programming and advanced data structures.

## 🚀 Performance Benchmarks
Powered by a custom-built Hash Table using the djb2 hashing algorithm and dynamic resizing, the core engine is incredibly fast.

- **Throughput:** ~1,000,000 Ops/Sec 
- **Workload:** 50,000 sequential `SET` operations
- **Latency:** Minimal overhead due to batched TCP streams and lock-free async processing.

## 🧠 Core Data Structures
Instead of relying on built-in language abstractions (like `Map` or `Set`), this database is powered by hand-written data structures to manage memory and time complexity efficiently:

1. **Custom Hash Table:** The primary key-value store. Handles collisions via chaining and resizes automatically at a 0.75 load factor.
2. **Doubly Linked List:** Powers the `LPUSH` and `RPOP` commands for sequential lists.
3. **LRU Cache:** Combines the Hash Table and Doubly Linked List to provide an O(1) Least Recently Used cache eviction policy (`CACHESET`, `CACHEGET`).
4. **Skip List:** The backbone of Sorted Sets (`ZADD`, `ZRANGE`), providing `O(log n)` performance similar to what real Redis uses under the hood.
5. **Min-Heap:** Manages time-to-live (TTL) key expirations (`EXPIRE`), allowing the background loop to proactively evict stale data in `O(1)` access time.

## 💾 Persistence
Features an RDB-style background snapshotting mechanism. Every 60 seconds, the in-memory Hash Table state is serialized and safely written to disk (`dump.rdb.json`). On startup, the server automatically loads this file into memory to ensure data survives process restarts.

## 🌐 Web Terminal
Includes a built-in WebSocket proxy that forwards raw TCP streams to the browser. This allows users to connect and interact with the database using a sleek web-based terminal UI without needing `netcat` installed.

## 🛠️ Usage

**1. Start the core database server:**
```bash
node src/server.js
```
*(Listens for raw TCP connections on port 6380)*

**2. Start the WebSocket Proxy:**
```bash
node src/web-proxy.js
```

**3. Access the Terminal:**
Open your browser and navigate to `http://localhost:3000`. You can now run commands like `SET name Rahul`, `GET name`, `LPUSH tasks code`, or `EXPIRE key 10`.
