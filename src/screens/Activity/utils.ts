// src/screens/Activity/utils.ts
import type { ActivityItem } from '../../api/types';
export const activityLabels = {
  accrual: 'Payback earned',
  reversal: 'Payback reversed',
  claim: 'Claim',
} as const;
export const mergeActivity = (previous: ActivityItem[], next: ActivityItem[]): ActivityItem[] => {
  const seen = new Set(previous.map((item) => item.id));
  return [
    ...previous,
    ...next.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }),
  ];
};
