'use client';

import React from 'react';
import { FiShield } from 'react-icons/fi';

interface Rule {
  id: number;
  title: string;
  description: string;
}

interface CommunityRulesProps {
  communityName: string;
  rules: Rule[];
}

export default function CommunityRules({ communityName, rules }: CommunityRulesProps) {
  return (
    <div className="bg-neutral-900 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiShield size={20} className="text-blue-400" />
        <h3 className="text-xl font-bold">Règles de h/{communityName}</h3>
      </div>
      
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border-b border-neutral-800 pb-4 last:border-0">
            <div className="font-medium text-lg mb-1">{rule.id}. {rule.title}</div>
            <div className="text-gray-400 text-sm">{rule.description}</div>
          </div>
        ))}
      </div>
      
      {rules.length === 0 && (
        <div className="text-gray-400 py-4 text-center">
          Cette communauté n'a pas encore défini de règles.
        </div>
      )}
    </div>
  );
} 