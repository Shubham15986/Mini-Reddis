// src/structures/HashTable.js

class HashTable {
  constructor(initialSize = 16) {
    this.buckets = new Array(initialSize).fill(null).map(() => []);
    this.size = 0;
    this.capacity = initialSize;
  }

  // A simple, effective string hashing algorithm (djb2)
  _hash(key) {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 33) ^ key.charCodeAt(i);
    }
    return Math.abs(hash % this.capacity);
  }

  set(key, value) {
    // Check load factor and resize if necessary before inserting
    if (this.size / this.capacity > 0.75) {
      this.resize();
    }

    const index = this._hash(key);
    const bucket = this.buckets[index];

    // Check for existing key to update
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket[i][1] = value;
        return;
      }
    }

    // If key doesn't exist, push new pair (chaining)
    bucket.push([key, value]);
    this.size++;
  }

  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        return bucket[i][1];
      }
    }
    return null; // Equivalent to Redis (nil)
  }

  delete(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.size--;
        return true; // Successfully deleted
      }
    }
    return false; // Key not found
  }

  resize() {
    const oldBuckets = this.buckets;
    
    this.capacity *= 2;
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
    this.size = 0; // Reset size, set() will increment it back

    // Rehash all existing entries into the new bucket array
    for (const bucket of oldBuckets) {
      for (const [key, value] of bucket) {
        this.set(key, value); 
      }
    }
  }
}

module.exports = HashTable;
