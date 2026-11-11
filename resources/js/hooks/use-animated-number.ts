import { useEffect, useRef, useState } from "react";

/** Like useCountUp, but animates from the previous value to the new `target` instead of from 0. */
export function useAnimatedNumber(target: number, duration = 1200) {
    const [display, setDisplay] = useState(0);
    const prev = useRef(0);

    useEffect(() => {
        const from = prev.current;
        prev.current = target;
        if (from === target) { setDisplay(target); return; }

        const start = performance.now();
        let raf: number;
        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
            setDisplay(Math.round(from + (target - from) * ease));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return display;
}
