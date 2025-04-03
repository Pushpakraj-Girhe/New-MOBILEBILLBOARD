import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export default function BudgetBreakdown({ budget }) {
  // Calculate budget breakdown based on the total budget
  // If no budget is provided, use a default value
  const totalBudget = budget ? Number.parseInt(budget.replace(/[^\d]/g, "")) : 10000

  // Calculate budget allocation based on total budget
  const billboardRental = Math.round(totalBudget * 0.8)
  const fuel = Math.round(totalBudget * 0.1)
  const adDesign = Math.round(totalBudget * 0.1)

  const data = [
    { name: "Billboard Rental", value: billboardRental },
    { name: "Fuel", value: fuel },
    { name: "Ad Design", value: adDesign },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="pb-2 border-b mb-4">
        <h3 className="text-base font-semibold">Budget Breakdown</h3>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Budget:</span>
          <span className="font-semibold">₹{totalBudget.toLocaleString()}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>
            • Billboard Rental: ₹{billboardRental.toLocaleString()} ({Math.round((billboardRental / totalBudget) * 100)}
            %)
          </p>
          <p>
            • Fuel and additional costs: ₹{fuel.toLocaleString()} ({Math.round((fuel / totalBudget) * 100)}%)
          </p>
          <p>
            • Professional ad design: ₹{adDesign.toLocaleString()} ({Math.round((adDesign / totalBudget) * 100)}%)
          </p>
        </div>
      </div>
    </div>
  )
}

