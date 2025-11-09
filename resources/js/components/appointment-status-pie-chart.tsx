'use client';

import * as React from 'react';
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export interface AppointmentStatusData {
    status: string;
    count: number;
}

interface AppointmentStatusRadialChartProps {
    appointmentStatuses: AppointmentStatusData[];
}

const chartConfig: ChartConfig = {
    appointments: {
        label: 'Appointments',
    },
    reserved: {
        label: 'Reserved',
        color: '#BE3544',
    },
    completed: {
        label: 'Completed',
        color: '#f0c9d7',
    },
};

export function AppointmentStatusRadialChart({ appointmentStatuses }: AppointmentStatusRadialChartProps) {
    const totalAppointments = React.useMemo(() => {
        return appointmentStatuses.reduce((acc, curr) => acc + curr.count, 0);
    }, [appointmentStatuses]);

    const chartData = React.useMemo(() => {
        const reserved = appointmentStatuses.find((s) => s.status === 'reserved')?.count || 0;
        const completed = appointmentStatuses.find((s) => s.status === 'completed')?.count || 0;
        return [
            {
                name: 'Appointments',
                reserved,
                completed,
            },
        ];
    }, [appointmentStatuses]);

    if (appointmentStatuses.length === 0) {
        return (
            <div className="flex h-full w-full flex-col bg-transparent">
                <div className="flex flex-col items-center p-4 pb-0">
                    <h2 className="text-lg font-semibold text-red-950 dark:text-white">Appointment Status</h2>
                    <p className="text-muted-foreground">No data available</p>
                </div>
                <div className="flex h-[300px] items-center justify-center">
                    <p className="text-muted-foreground">No appointment data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col bg-transparent">
            <div className="flex flex-col items-center p-4 pb-0">
                <h2 className="text-lg font-semibold text-red-950 dark:text-white">Appointment Status</h2>
                <p className="text-muted-foreground dark:text-gray-300">Current distribution</p>
            </div>

            <div className="mt-4 flex-1">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-w-[200px]">
                    <RadialBarChart data={chartData} startAngle={180} endAngle={0} innerRadius={80} outerRadius={130}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        const { cx, cy } = viewBox as { cx: number; cy: number };
                                        return (
                                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={cx} y={cy - 10} className="text-3xl font-bold text-red-950 dark:text-red-300">
                                                    {totalAppointments.toLocaleString()}
                                                </tspan>
                                                <tspan x={cx} y={cy + 16} className="fill-muted-foreground">
                                                    Visitors
                                                </tspan>
                                            </text>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PolarRadiusAxis>

                        <RadialBar
                            dataKey="reserved"
                            stackId="a"
                            cornerRadius={8}
                            fill={chartConfig.reserved.color}
                            className="stroke-transparent stroke-2"
                        />
                        <RadialBar
                            dataKey="completed"
                            stackId="a"
                            cornerRadius={8}
                            fill={chartConfig.completed.color}
                            className="stroke-transparent stroke-2"
                        />
                    </RadialBarChart>
                </ChartContainer>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
                {appointmentStatuses.map((item) => (
                    <div key={item.status} className="flex items-center gap-1">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: chartConfig[item.status as keyof typeof chartConfig]?.color || '#ccc' }}
                        ></div>
                        <span className="text-muted-foreground capitalize">{item.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
