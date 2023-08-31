const obj = {
  getSelection() {
    const selection = window.getSelection();
    return Object.assign(selection, obj);
  },

  getRange() {
    if (this.rangeCount === 0) return null;
    return this.getRangeAt(0);
  },

  // 选区是否在元素内
  isRangeInEl(el) {
    const range = this.getRange();
    if (!range) return false;
    return el.contains(range.commonAncestorContainer);
  },

  // 保存选区
  saveRange() {
    if (this.rangeCount > 0) {
      this.cacheRange = this.getRangeAt(0);
    }
  },

  // 恢复选区
  restoreRange() {
    const selection = this.getSelection();
    selection.removeAllRanges();
    if (this.cacheRange) {
      selection.addRange(this.cacheRange);
      this.cacheRange = null;
    }
  },

  // 查询选区状态
  queryState(attr) {
    const selection = this.getSelection();
    if (attr === "bold") return document.queryCommandState("bold");
    if (attr === "color") return document.queryCommandValue("foreColor");
    if (attr === "text") return selection.toString();
    if (attr === "fontSize") {
      let node = selection.getRange().startContainer;
      const ele =
        node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      const computedStyle = window.getComputedStyle(ele);
      return computedStyle.fontSize;
    }
  },
};

export const getSelection = obj.getSelection;
