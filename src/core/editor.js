import { getSelection } from "./utils/selection.js";
import validElementState from "./utils/validElementState.js";
import debounce from "lodash-es/debounce";

class Editor {
  el;
  color = "";
  bold = false;
  fontSize = "";
  #composing = false;
  getSelection = getSelection;

  static defaultOptions = {
    el: "#editor",
    content: "",
    maxlength: Infinity,
    mode: "textarea",
  };

  constructor(options = {}) {
    options = Object.assign({}, Editor.defaultOptions, options);
    const el =
      typeof options.el === "string"
        ? document.querySelector(options.el)
        : options.el;
    // 初始化样式
    el.style.outline = "none";
    el.style.overflowY = "auto";
    el.contentEditable = true;
    // 初始化内容
    el.innerHTML = options.content;
    // 初始化状态
    this.maxlength = options.maxlength;
    // 禁止换行
    if (options.mode === "input")
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault();
      });
    // 初始化字数限制
    el.addEventListener("keypress", (e) => {
      if (this.text.length >= this.maxlength) e.preventDefault();
    });
    el.addEventListener("compositionstart", () => (this.#composing = true));
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
        document.execCommand(
          "insertText",
          false,
          text.substring(0, offset - diff)
        );
      }
      this.#composing = false;
    });
    el.addEventListener("paste", (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      let pastedText = clipboardData.getData("text");
      const diff = el.textContent.length + pastedText.length - this.maxlength;
      if (diff > 0) pastedText = pastedText.slice(0, -diff);
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
      handler = debounce(callback.bind(this), 300);
      this.el.addEventListener("input", handler);
    }
    // selectionchange
    if (eventName === "selectionchange") {
      handler = debounce(() => {
        if (this.#codeSelectionChange) {
          this.#codeSelectionChange = false;
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
          text: selection.queryState("text"),
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

  #codeSelectionChange = false;

  // 编辑区文本格式化
  formatText(attr, value) {
    if (attr === "color") this.color = value;
    if (attr === "bold") this.bold = !this.bold;
    const selection = getSelection();
    selection.selectAllChildren(this.el);
    let commandName = attr;
    this.#execCommand(commandName, value);
    selection.removeAllRanges();
    this.el.blur();
  }

  // 选区文本格式化
  format(attr, value) {
    this.#codeSelectionChange = true;
    const selection = getSelection();
    // 选区为空
    if (!selection.getRange() || !selection.isRangeInEl(this.el)) return;
    let commandName = attr;
    attr === "color" && (commandName = "foreColor");
    this.#execCommand(commandName, value);
  }

  // 执行编辑命令
  #execCommand(command, value) {
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
}

export default Editor;
