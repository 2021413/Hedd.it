import Link from "next/link";
import { ReactNode } from "react";
import { FiEdit } from "react-icons/fi";

interface TabContentProps {
  activeTab: string;
  userId: string;
  hasData: boolean;
  emptyMessage: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionLink?: string;
}

export default function TabContent({ activeTab, userId, hasData, emptyMessage, icon, actionLabel, actionLink }: TabContentProps) {
  if (hasData) {
    return <div className="text-white">Contenu simulé (à implémenter)</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      {icon && <div className="w-24 h-24 mb-6 bg-neutral-800 rounded-full flex items-center justify-center">{icon}</div>}
      <h3 className="text-lg font-medium text-white mb-2">{emptyMessage}</h3>
      {actionLabel && actionLink && (
        <Link
          href={actionLink}
          className="mt-4 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
} 