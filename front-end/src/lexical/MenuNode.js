import { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin"

export class CommandOption extends MenuOption {
  constructor(name, options = {}) {
    super(name)
    this.name = name
    this.icon = options.icon
    this.keywords = options.keywords || []
  }
}
