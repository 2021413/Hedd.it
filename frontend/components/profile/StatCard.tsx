interface StatCardProps {
  label: string;
  value: number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-neutral-900 p-4 rounded-2xl">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
} 