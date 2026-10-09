import React, { createPortal } from "react-dom"

function MentionMenu({
  anchorElementRef,
  selectedIndex,
  selectOptionAndCleanUp,
  options,
}) {
  if (!anchorElementRef.current || options.length === 0) return null

  return createPortal(
    <div
      className="typeahead-menu "
      style={{ position: "absolute", zIndex: 100 }}
    >
      <ul>
        {options.map((option, index) => (
          <li
            key={option.key}
            className={selectedIndex === index ? "active" : ""}
            onClick={() => selectOptionAndCleanUp(option)}
          >
            {option.name}
          </li>
        ))}
      </ul>
    </div>,
    anchorElementRef.current
  )
}

export default MentionMenu
