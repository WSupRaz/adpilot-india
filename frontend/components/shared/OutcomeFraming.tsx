interface OutcomeFramingProps {
  metric: string;
  value: string;
  change: { direction: "up" | "down"; percent: number } | null;
}

export function OutcomeFraming({ metric, value, change }: OutcomeFramingProps) {
  return (
    <div className="rounded-lg border p-4 space-y-1">
      <p className="text-sm text-muted-foreground">{metric}</p>
      <p className="text-2xl font-bold">{value}</p>
      {change && (
        <p
          className={`text-xs font-medium ${
            change.direction === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {change.direction === "up" ? "↑" : "↓"} {change.percent}% vs last month
        </p>
      )}
    </div>
  );
}
