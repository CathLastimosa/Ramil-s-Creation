"use client"

import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface MonthlyData {
  month: string
  appointments: number
  bookings: number
  serviceBookings: number
}

interface CombinedBarChartProps {
  monthlyData: MonthlyData[]
}

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "#A51212", // blue
  },
  bookings: {
    label: "Bookings",
    color: "#FEE4E6", // orange
  },
  serviceBookings: {
    label: "Service Bookings",
    color: "#FF869A", // purple
  },
}

const monthsOrder = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export default function CombinedBarChart({ monthlyData }: CombinedBarChartProps) {
  const normalizedData = monthsOrder.map((month) => {
    const existing = monthlyData.find((m) => m.month === month)
    return (
      existing || {
        month,
        appointments: 0,
        bookings: 0,
        serviceBookings: 0,
      }
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-4">
        <h3 className="text-base font-semibold leading-none tracking-tight ">
          Monthly Comparison
        </h3>
        <p className="text-xs text-muted-foreground">January - December</p>
      </div>

      {/* Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={normalizedData} barGap={3} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              content={({ active, payload }) =>
                active && payload ? (
                  <div className="rounded-md border bg-background/95 p-2 shadow-md text-xs">
                    {payload.map((entry, i) => (
                      <p key={i}>
                        {chartConfig[entry.dataKey as keyof typeof chartConfig]?.label}:{" "}
                        <span className="font-semibold">{entry.value}</span>
                      </p>
                    ))}
                  </div>
                ) : null
              }
            />
            <Bar
              dataKey="appointments"
              fill={chartConfig.appointments.color}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="bookings"
              fill={chartConfig.bookings.color}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="serviceBookings"
              fill={chartConfig.serviceBookings.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

      {/* Footer */}
      <div className="flex flex-col p-4 pt-0 gap-1 text-xs text-gray-500">
        <div className="flex gap-2 items-center font-medium text-gray-600 dark:text-gray-300">
          Showing total bookings and appointments trend.
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </div>
    </div>
  )
}
