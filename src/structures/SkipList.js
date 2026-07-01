class SkipListNode {
  constructor(member, score, level) {
    this.member = member;
    this.score = score;
    this.forward = new Array(level).fill(null);
  }
}

class SkipList {
  constructor(maxLevel = 16, p = 0.5) {
    this.maxLevel = maxLevel;
    this.p = p;
    this.header = new SkipListNode(null, -Infinity, maxLevel);
    this.level = 1;
    this.members = new Map(); // Fast lookup by member name
  }

  _randomLevel() {
    let lvl = 1;
    while (Math.random() < this.p && lvl < this.maxLevel) {
      lvl++;
    }
    return lvl;
  }

  insert(member, score) {
    if (this.members.has(member)) {
      // If member exists, we'd normally update the score. 
      // For simplicity in this demo, we ignore or delete/re-insert.
      return false; 
    }

    const update = new Array(this.maxLevel).fill(null);
    let current = this.header;

    // Find insertion points
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] && current.forward[i].score < score) {
        current = current.forward[i];
      }
      update[i] = current;
    }

    const newLevel = this._randomLevel();
    if (newLevel > this.level) {
      for (let i = this.level; i < newLevel; i++) {
        update[i] = this.header;
      }
      this.level = newLevel;
    }

    const newNode = new SkipListNode(member, score, newLevel);
    for (let i = 0; i < newLevel; i++) {
      newNode.forward[i] = update[i].forward[i];
      update[i].forward[i] = newNode;
    }

    this.members.set(member, score);
    return true;
  }

  range(startIdx, endIdx) {
    const result = [];
    let current = this.header.forward[0];
    let idx = 0;

    while (current && idx <= endIdx) {
      if (idx >= startIdx) {
        result.push(`${current.member} (${current.score})`);
      }
      current = current.forward[0];
      idx++;
    }
    return result;
  }
}

module.exports = SkipList;
