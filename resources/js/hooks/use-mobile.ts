import * as React from "react"

const MOBILE_BREAKPOINT = 768

/** Width at which the app shell switches to the desktop sidebar — must match the `lg` breakpoint
 * that resources/css/demos/demo1.css uses to reserve the sidebar's space (Tailwind `lg` = 1024px).
 * Using MOBILE_BREAKPOINT for the shell left 768–1023px with a desktop sidebar overlapping content. */
export const LAYOUT_DESKTOP_BREAKPOINT = 1024

export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < breakpoint)
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isMobile
}
