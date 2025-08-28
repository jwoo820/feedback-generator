// components/types.ts
export type Row = {
  id: string;
  reflect: "미반영" | "검토중" | "반영완료" | string;
  item: string;
  platform: ("APP" | "Web")[];
  content?: string;
  owner?: string;
  createdAt: string;
  _editing?: boolean;
};