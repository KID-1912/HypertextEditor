// 富文本内容的指定样式是否统一
export default function validElementState(root, styleProp, styleValue) {
  let result = true;
  traverseNode(root);
  function traverseNode(node) {
    // 元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node !== root && node.style[styleProp]) {
        result = node.style[styleProp] === styleValue;
        return;
      }
      for (const childNode of node.childNodes) {
        traverseNode(childNode);
        if (result === false) return;
      }
    } else {
      while (node !== root) {
        node = node.parentElement;
        if (node.style[styleProp]) {
          result = node.style[styleProp] === styleValue;
          return;
        }
      }
      result = false;
    }
  }

  return result;
}
