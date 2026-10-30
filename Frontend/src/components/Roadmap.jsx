import { useMemo, useRef, useLayoutEffect  } from 'react';
import RoadmapRow from '../models/RoadmapRow';

const LABEL_WIDTH = 276;
const UNDATED_WIDTH = 420;
const DAY_WIDTH = 72;
const DAY_MS = 24 * 60 * 60 * 1000;

function toValidDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthStart(date, offset = 0) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
}

function getTimeline(columns) {
    const taskDates = columns.flatMap(column => (column.tasks || [])
        .map(task => toValidDate(task.dueDate))
        .filter(Boolean))
        .sort((first, second) => first - second);
    
    const now = new Date();
    const minDate = taskDates.length && taskDates[0] < now ? taskDates[0] : now;
    const maxDate = taskDates.length && taskDates[taskDates.length - 1] > now ? taskDates[taskDates.length - 1] : now;
    
    const firstMonth = getMonthStart(minDate, -2);
    const lastMonth = getMonthStart(maxDate, 6);
    
    const start = firstMonth.getTime();
    const end = lastMonth.getTime();
    const dayCount = Math.max(1, Math.ceil((end - start) / DAY_MS));
    const width = dayCount * DAY_WIDTH;
    
    const days = Array.from({ length: dayCount }, (_, index) => {
        const date = new Date(start + index * DAY_MS);
        return {
            key: date.toISOString().slice(0, 10),
            day: date.getUTCDate(),
            month: date.toLocaleDateString('ru-RU', { month: '2-digit', year: 'numeric', timeZone: 'UTC' })
        };
    });

    const months = [];
    days.forEach((day, index) => {
        const previousDay = days[index - 1];
        if (!previousDay || previousDay.month !== day.month) {
            months.push({ label: day.month, left: index * DAY_WIDTH });
        }
    });

    return { start, end, width, days, months };
}

function Roadmap({ columns, onColumnUpdate, onColumnDelete }) {
    const timeline = useMemo(() => getTimeline(columns), [columns]);
    const gridColumns = `${LABEL_WIDTH}px ${UNDATED_WIDTH}px ${timeline.width}px`;

    const scrollRef = useRef(null);
    const prevStartRef = useRef(timeline.start);

    // Якорение: если шкала расширилась или сузилась слева — сдвигаем скролл синхронно
    useLayoutEffect(() => {
        if (prevStartRef.current !== null && prevStartRef.current !== timeline.start) {
            const diffDays = Math.round((prevStartRef.current - timeline.start) / DAY_MS);
            const diffPx = diffDays * DAY_WIDTH;

            if (scrollRef.current && diffPx !== 0) {
                scrollRef.current.scrollLeft += diffPx;
            }
        }
        prevStartRef.current = timeline.start;
    }, [timeline.start]);
    
    return (
        <div className="roadmap-scroll roadmap-view" ref={scrollRef}>
            <div className="roadmap-grid" style={{ gridTemplateColumns: gridColumns }}>
                <div className="roadmap-header roadmap-label roadmap-corner">Группа</div>
                <div className="roadmap-header roadmap-label roadmap-undated-header">Без даты</div>
                <div className="roadmap-header roadmap-time-header">
                    <div className="roadmap-month-axis" style={{ width: timeline.width }}>
                        {timeline.months.map(month => (
                            <div className="roadmap-month" key={`${month.left}-${month.label}`} style={{ left: month.left }}>
                                {month.label}
                            </div>
                        ))}
                    </div>
                    <div className="roadmap-day-axis">
                        {timeline.days.map(day => (
                            <div className="roadmap-day" key={day.key} title={day.key}>
                                {String(day.day).padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>

                {columns.map(column => (
                    <RoadmapRow
                        key={column.id}
                        column={column}
                        timeline={timeline}
                        onColumnUpdate={onColumnUpdate}
                        onColumnDelete={() => onColumnDelete(column)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Roadmap;
