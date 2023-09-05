import _classPrivateFieldLooseBase from "@babel/runtime-corejs3/helpers/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime-corejs3/helpers/classPrivateFieldLooseKey";
import _Object$assign from "@babel/runtime-corejs3/core-js-stable/object/assign";
import _Object$defineProperty from "@babel/runtime-corejs3/core-js-stable/object/define-property";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import _bindInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/bind";
import { d as debounce } from './lodash-utils.js';
const obj = {
  getSelection() {
    const selection = window.getSelection();
    return _Object$assign(selection, obj);
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
      const ele = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      const computedStyle = window.getComputedStyle(ele);
      return computedStyle.fontSize;
    }
  }
};
const getSelection = obj.getSelection;

// 富文本内容的指定样式是否统一
function validElementState(root, styleProp, styleValue) {
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
var _composing = /*#__PURE__*/_classPrivateFieldLooseKey("composing");
var _codeSelectionChange = /*#__PURE__*/_classPrivateFieldLooseKey("codeSelectionChange");
var _execCommand = /*#__PURE__*/_classPrivateFieldLooseKey("execCommand");
class Editor {
  constructor(options) {
    if (options === void 0) {
      options = {};
    }
    // 执行编辑命令
    _Object$defineProperty(this, _execCommand, {
      value: _execCommand2
    });
    this.el = void 0;
    this.color = "";
    this.bold = false;
    this.fontSize = "";
    _Object$defineProperty(this, _composing, {
      writable: true,
      value: false
    });
    this.getSelection = getSelection;
    _Object$defineProperty(this, _codeSelectionChange, {
      writable: true,
      value: false
    });
    options = _Object$assign({}, Editor.defaultOptions, options);
    const el = typeof options.el === "string" ? document.querySelector(options.el) : options.el;
    // 初始化样式
    el.style.outline = "none";
    el.style.overflowY = "auto";
    el.contentEditable = true;
    // 初始化内容
    el.innerHTML = options.content;
    // 初始化状态
    this.maxlength = options.maxlength;
    // 禁止换行
    if (options.mode === "input") el.addEventListener("keydown", e => {
      if (e.key === "Enter") e.preventDefault();
    });
    // 初始化字数限制
    el.addEventListener("keypress", e => {
      if (this.text.length >= this.maxlength) e.preventDefault();
    });
    el.addEventListener("compositionstart", () => _classPrivateFieldLooseBase(this, _composing)[_composing] = true);
    el.addEventListener("compositionend", () => {
      const diff = this.text.length - this.maxlength;
      if (diff > 0) {
        const range = document.createRange();
        const sel = getSelection();
        const node = sel.anchorNode;
        const offset = sel.anchorOffset;
        const text = node.textContent;
        range.selectNodeContents(node);
        sel.removeAllRanges();
        sel.addRange(range);
        sel.extend(node, offset);
        document.execCommand("delete", false);
        document.execCommand("insertText", false, text.substring(0, offset - diff));
      }
      _classPrivateFieldLooseBase(this, _composing)[_composing] = false;
    });
    el.addEventListener("paste", e => {
      const clipboardData = e.clipboardData || window.clipboardData;
      let pastedText = clipboardData.getData("text");
      const diff = el.textContent.length + pastedText.length - this.maxlength;
      if (diff > 0) pastedText = _sliceInstanceProperty(pastedText).call(pastedText, 0, -diff);
      document.execCommand("insertText", false, pastedText); // 将纯文本内容插入到编辑器中
      e.preventDefault();
    });
    this.el = el;
  }
  get content() {
    return this.el.innerHTML;
  }
  get text() {
    return this.el.textContent;
  }
  on(eventName, callback) {
    let handler;
    // change
    if (eventName === "change") {
      handler = debounce(_bindInstanceProperty(callback).call(callback, this), 300);
      this.el.addEventListener("input", handler);
    }
    // selectionchange
    if (eventName === "selectionchange") {
      handler = debounce(() => {
        if (_classPrivateFieldLooseBase(this, _codeSelectionChange)[_codeSelectionChange]) {
          _classPrivateFieldLooseBase(this, _codeSelectionChange)[_codeSelectionChange] = false;
          return;
        }
        if (document.activeElement !== this.el) {
          return callback.call(this, null); // 选区不在编辑区内
        }

        const selection = getSelection();
        const state = {
          bold: selection.queryState("bold"),
          color: selection.queryState("color"),
          fontSize: selection.queryState("fontSize"),
          text: selection.queryState("text")
        };
        callback.call(this, state);
      }, 300);
      document.addEventListener("selectionchange", handler);
    }
    return handler;
  }
  off(eventName, handler) {
    if (eventName === "change") {
      this.el.removeEventListener("input", handler);
    }
    if (eventName === "selectionchange") {
      document.removeEventListener("selectionchange", handler);
    }
  }
  // 编辑区文本格式化
  formatText(attr, value) {
    if (attr === "color") this.color = value;
    if (attr === "bold") this.bold = !this.bold;
    const selection = getSelection();
    selection.selectAllChildren(this.el);
    let commandName = attr;
    _classPrivateFieldLooseBase(this, _execCommand)[_execCommand](commandName, value);
    selection.removeAllRanges();
    this.el.blur();
  }

  // 选区文本格式化
  format(attr, value) {
    _classPrivateFieldLooseBase(this, _codeSelectionChange)[_codeSelectionChange] = true;
    const selection = getSelection();
    // 选区为空
    if (!selection.getRange() || !selection.isRangeInEl(this.el)) return;
    let commandName = attr;
    attr === "color" && (commandName = "foreColor");
    _classPrivateFieldLooseBase(this, _execCommand)[_execCommand](commandName, value);
  }
}
function _execCommand2(command, value) {
  const selection = getSelection();
  // 基础命令
  document.execCommand("styleWithCSS", true);
  command === "color" && (command = "foreColor");
  document.execCommand(command, false, value);
  // 修改字号
  if (command === "fontSize") {
    const node = selection.anchorNode.parentNode;
    node.style.fontSize = value;
  }
  // 更新editor全局状态
  selection.saveRange();
  selection.selectAllChildren(this.el);
  if (command === "foreColor") {
    const forceColor = selection.queryState("color");
    if (this.color !== forceColor) this.color = forceColor;
  }
  if (command === "bold") {
    const bold = selection.queryState("bold");
    if (this.bold !== bold) this.bold = bold;
  }
  if (command === "fontSize") {
    const checked = validElementState(this.el, "fontSize", value);
    if (checked) this.fontSize = value;
  }
  selection.restoreRange();
}
Editor.defaultOptions = {
  el: "#editor",
  content: "",
  maxlength: Infinity,
  mode: "textarea"
};
export { Editor as default };
