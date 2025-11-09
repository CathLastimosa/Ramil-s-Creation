import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import * as React from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';

export interface BookingStatusData {
    status: string;
    count: number;
}

interface BookingStatusPieChartProps {
    bookingStatuses: BookingStatusData[];
    serviceBookingStatuses: BookingStatusData[];
}

const chartConfig: ChartConfig = {
    bookings: {
        label: 'Bookings',
    },
    pending: {
        label: 'Pending',
        color: '#ef4444',
    },
    confirmed: {
        label: 'Confirmed',
        color: '#f87171',
    },
    completed: {
        label: 'Completed',
        color: '#fecaca',
    },
    cancelled: {
        label: 'Cancelled',
        color: '#991b1b',
    },
};

export function BookingStatusPieChart({ bookingStatuses }: BookingStatusPieChartProps) {
    const totalBookings = React.useMemo(() => {
        return bookingStatuses.reduce((acc, curr) => acc + curr.count, 0);
    }, [bookingStatuses]);

    const chartData = React.useMemo(() => {
        const statusOrder = ['pending', 'confirmed', 'completed', 'cancelled'];
        const orderedData = statusOrder
            .map((status) => {
                const item = bookingStatuses.find((s) => s.status === status);
                return item
                    ? {
                          status: item.status,
                          count: item.count,
                          fill: chartConfig[item.status as keyof typeof chartConfig]?.color as string,
                      }
                    : null;
            })
            .filter(Boolean) as any[];

        return orderedData;
    }, [bookingStatuses]);

    if (bookingStatuses.length === 0) {
        return (
            <div className="flex h-full w-full flex-col bg-transparent">
                <div className="flex flex-col items-center p-4 pb-0">
                    <h2 className="text-lg font-semibold text-red-950 dark:text-white">Booking Status</h2>
                    <p className="text-muted-foreground">No data available</p>
                </div>
                <div className="flex h-[300px] items-center justify-center">
                    <p className="text-muted-foreground">No booking data available</p>
                </div>
            </div>
        );
    }

    const activeIndex = chartData.findIndex((item) => item.status === 'pending');

    return (
        <div className="flex h-full w-full flex-col bg-transparent">
            <div className="flex flex-col items-center p-4 pb-0">
                <h2 className="text-lg font-semibold text-red-950 dark:text-white">Booking Status</h2>
                <p className="text-muted-foreground">Current distribution</p>
            </div>

            <div className="flex-1 p-4 pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[220px]">
                    <PieChart>
                        <defs>
                            <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.25)" />
                            </filter>
                        </defs>

                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={50}
                            outerRadius={75}
                            strokeWidth={4}
                            activeIndex={activeIndex}
                            activeShape={({ outerRadius = 0, ...props }) => (
                                <g filter="url(#pieShadow)">
                                    <Sector {...props} outerRadius={outerRadius + 6} />
                                    <Sector {...props} outerRadius={outerRadius + 12} innerRadius={outerRadius + 8} />
                                </g>
                            )}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                                                    {totalBookings.toLocaleString()}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-sm">
                                                    Bookings
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </div>

            <div className="flex flex-wrap gap-2 p-4 text-sm">
                {chartData.map((item) => (
                    <div key={item.status} className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                        <span className="text-muted-foreground capitalize">{item.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
