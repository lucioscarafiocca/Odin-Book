import { useEffect, useRef } from "react"

function TypeMenu({ open = false, dialog }) {
  const anchorRef = useRef(null)

  useEffect(() => {
    console.log(open)
    if (open != false) {
      const rect = dialog.current.getBoundingClientRect()
      console.log(rect)
      console.log(open)
      anchorRef.current.style.display = "block"
      anchorRef.current.style.top = `${open.top - rect.top + 20}px`
      anchorRef.current.style.left = `${open.left - rect.left}px`
    } else {
      anchorRef.current.style.display = "none"
    }
  }, [open])

  return (
    <>
      <div
        popover="auto"
        ref={anchorRef}
        style={{
          position: "absolute",
        }}
        className="text-black bg-amber-600 z-10000 "
      >
        <p>1 </p>
        <p>2</p>
      </div>
    </>
  )
}

export default TypeMenu
