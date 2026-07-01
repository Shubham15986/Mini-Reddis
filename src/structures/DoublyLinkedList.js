class DLLNode {
  constructor(value, key = null) {
    this.value = value;
    this.key = key; // Storing key helps with LRU eviction
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = new DLLNode(null); // Sentinel head
    this.tail = new DLLNode(null); // Sentinel tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  pushFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
    this.size++;
  }

  pushBack(node) {
    node.prev = this.tail.prev;
    node.next = this.tail;
    this.tail.prev.next = node;
    this.tail.prev = node;
    this.size++;
  }

  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.size--;
  }

  popBack() {
    if (this.size === 0) return null;
    const lruNode = this.tail.prev;
    this.remove(lruNode);
    return lruNode;
  }
}

module.exports = { DLLNode, DoublyLinkedList };
