'use client';

import { CalendarCheck2 } from 'lucide-react';
import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface ServiceBookingData {
    date: string;
    value: number;
}

interface ServiceBookingChartProps {
    serviceBookingsData: ServiceBookingData[];
    period: string;
}

export default function ServiceBookingChart({ serviceBookingsData, period }: ServiceBookingChartProps) {
    const total = useMemo(() => serviceBookingsData.reduce((sum, item) => sum + item.value, 0), [serviceBookingsData]);

    const color = 'var(--color-accent2)';
    const gradientId = 'serviceBookingsGradient';

    return (
        <div className="h-full space-y-4 p-4">
            <div className="flex items-center gap-2">
                <CalendarCheck2 className="size-5" style={{ color }} />
                <span className="text-base font-semibold text-red-950 dark:text-white">Total Service </span>
            </div>
            <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="text-sm whitespace-nowrap text-muted-foreground">{period}</div>
                    <div className="text-3xl font-bold tracking-tight text-red-950 dark:text-white">{total.toString()}</div>
                </div>
                <div className="min-w-0 flex-1">
                    <ResponsiveContainer width="100%" height={60}>
                        <AreaChart
                            data={serviceBookingsData}
                            margin={{
                                top: 5,
                                right: 0,
                                left: 0,
                                bottom: 5,
                            }}
                        >
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                                </linearGradient>
                                <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
                                </filter>
                            </defs>

                            <Tooltip
                                cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '2 2' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const value = payload[0].value as number;
                                        return (
                                            <div className="pointer-events-none rounded-lg border border-border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
                                                <p className="text-sm font-semibold text-foreground">{value} service bookings</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                fill={`url(#${gradientId})`}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill: color,
                                    stroke: 'white',
                                    strokeWidth: 2,
                                    filter: 'url(#dotShadow)',
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
