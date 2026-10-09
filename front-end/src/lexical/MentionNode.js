import { TextNode } from "lexical"

export class MentionNode extends TextNode {
  static getType() {
    return "mention"
  }

  static clone(node) {
    return new MentionNode(node.__text, node.__key)
  }

  constructor(text, key) {
    super(text, key)
  }

  // isSimpleText() {
  //   return true
  // }

  createDOM(config) {
    const element = super.createDOM(config)
    element.style.color = "#1da1f2"
    // const dom = super.createElement("span")
    // dom.style.color = "#1d9bf0"
    // dom.className = "mention-node"
    return element
  }
  updateDOM(prevNode, dom, config) {
    return super.updateDOM(prevNode, dom, config)
  }
  updateDom() {
    return false
  }

  isInline() {
    return true
  }

  // canInsertTextAfter() {
  //   return false
  // }

  static importJSON(serializedNode) {
    // const element = super.createDOM(config)
    // const node = $createMentionNode(serializedNode.text)
    //  node.setFormat(serializedNode.format)
    // node.setStyle(serializedNode.style)
    return $createMentionNode(serializedNode.text)
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "mention",
    }
  }
}
export const $isMentionNode = (node) => {
  return node instanceof MentionNode
}

export const $createMentionNode = (text) => {
  return new MentionNode(text)
}
