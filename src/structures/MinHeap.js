class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(key, expiresAt) {
    this.heap.push({ key, expiresAt });
    this._bubbleUp(this.heap.length - 1);
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._bubbleDown(0);
    return root;
  }

  _bubbleUp(index) {
    while (index > 0) {
      let parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].expiresAt <= this.heap[index].expiresAt) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  _bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;

      if (left < length && this.heap[left].expiresAt < this.heap[smallest].expiresAt) smallest = left;
      if (right < length && this.heap[right].expiresAt < this.heap[smallest].expiresAt) smallest = right;
      
      if (smallest === index) break;
      
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

module.exports = MinHeap;
