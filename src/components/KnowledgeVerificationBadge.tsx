import React from "react";
import { CheckCircle2, CloudOff } from "lucide-react";

interface KnowledgeVerificationBadgeProps {
  sourceName?: string;
}

export const KnowledgeVerificationBadge: React.FC<KnowledgeVerificationBadgeProps> = ({ sourceName }) => {
  if (!sourceName) return null;

  const isVerified = sourceName !== "Offline Knowledge Base" && sourceName !== "Unverified";

  return (
    <div className={`col-span-2 rounded-xl p-3 border flex items-center justify-between ${
      isVerified 
        ? "bg-emerald-900/20 border-emerald-500/10" 
        : "bg-orange-900/20 border-orange-500/10"
    }`}>
      <span className={`block text-[9px] uppercase font-mono tracking-widest ${
        isVerified ? "text-emerald-400/80" : "text-orange-400/80"
      }`}>
        Knowledge Verification
      </span>
      <span className={`font-bold font-mono text-xs flex items-center gap-1.5 ${
        isVerified ? "text-emerald-400" : "text-orange-400"
      }`}>
        {isVerified ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified by: {sourceName}
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5" />
            {sourceName}
          </>
        )}
      </span>
    </div>
  );
};
