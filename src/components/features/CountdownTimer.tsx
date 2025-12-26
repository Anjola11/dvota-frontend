import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

interface CountdownTimerProps {
    targetDate: string;
    onComplete?: () => void;
}

export const CountdownTimer = ({ targetDate, onComplete }: CountdownTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = differenceInSeconds(target, now);

            if (diff <= 0) {
                setTimeLeft(0);
                onComplete?.();
                return;
            }
            setTimeLeft(diff);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [targetDate, onComplete]);

    const formatTime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        return { d, h, m, s };
    };

    const { d, h, m, s } = formatTime(timeLeft);

    return (
        <div className="flex items-center space-x-2 text-sm font-medium">
            {d > 0 && (
                <>
                    <span className="bg-gray-100 px-2 py-1 rounded">{String(d).padStart(2, '0')}d</span>
                    <span>:</span>
                </>
            )}
            <span className="bg-gray-100 px-2 py-1 rounded">{String(h).padStart(2, '0')}h</span>
            <span>:</span>
            <span className="bg-gray-100 px-2 py-1 rounded">{String(m).padStart(2, '0')}m</span>
            <span>:</span>
            <span className="bg-gray-100 px-2 py-1 rounded text-primary">{String(s).padStart(2, '0')}s</span>
        </div>
    );
};
