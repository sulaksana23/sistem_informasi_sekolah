import { useEffect, useRef, useState } from "react";

/** Counts from 0 up to `to` with an ease-out-cubic curve; restarts from 0 whenever `to` changes. */
export function useCountUp(to: number, duration = 1200) {
    const [value, setValue] = useState(0);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const start = performance.now();
        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * to));
            if (progress < 1) frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [to, duration]);

    return value;
}
