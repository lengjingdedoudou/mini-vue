import { createRenderer } from '../runtime-core';

let renderer;

// dom平台特有的节点操作
const rendererOptions = {
  querySelector(selector) {
    return document.querySelector(selector);
  },
  insert(child, parent, anchor) {
    // 设置为null则为appendChild
    parent.insertBefore(child, anchor || null);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  createElement(tag) {
    return document.createElement(tag);
  },
  clearElement(el) {
    el.textContent = '';
  },
  addElementEventListener(el, event, callback) {
    el.addEventListener(event, callback);
  },
};

export function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}

export function createApp(rootComponent) {
  return ensureRenderer().createApp(rootComponent);
}
