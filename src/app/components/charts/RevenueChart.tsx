// src/app/components/charts/RevenueChart.tsx

'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Line Chart
export function RevenueLineChart({ data }: { data: ChartData }) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0]?.data[index] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          name={data.datasets[0]?.label || 'Revenue'}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Bar Chart
export function RevenueBarChart({ data }: { data: ChartData }) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0]?.data[index] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Legend />
        <Bar
          dataKey="value"
          fill="#3b82f6"
          name={data.datasets[0]?.label || 'Revenue'}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Pie Chart
export function RevenuePieChart({ data }: any) {
  const chartData = data.labels.map((label: string, index: number) => ({
    name: label,
    value: data.datasets[0]?.data[index] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          dataKey="value"
        >
          {chartData.map((_: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Area Chart (for cumulative data)
export function RevenueAreaChart({ data }: { data: ChartData }) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0]?.data[index] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.3}
          name={data.datasets[0]?.label || 'Revenue'}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}