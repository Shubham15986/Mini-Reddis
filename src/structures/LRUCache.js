const HashTable = require('./HashTable');
const { DLLNode, DoublyLinkedList } = require('./DoublyLinkedList');

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new HashTable(capacity); // Key -> DLLNode
    this.list = new DoublyLinkedList(); // Recency order
  }

  get(key) {
    const node = this.map.get(key);
    if (!node) return null;

    // Move to front (Most Recently Used)
    this.list.remove(node);
    this.list.pushFront(node);
    return node.value;
  }

  set(key, value) {
    let node = this.map.get(key);

    if (node) {
      node.value = value;
      this.list.remove(node);
      this.list.pushFront(node);
    } else {
      if (this.list.size >= this.capacity) {
        // Evict Least Recently Used
        const lruNode = this.list.popBack();
        this.map.delete(lruNode.key);
      }
      const newNode = new DLLNode(value, key);
      this.list.pushFront(newNode);
      this.map.set(key, newNode);
    }
  }
}

module.exports = LRUCache;
