export type Platform = "Instagram" | "LinkedIn" | "X" | "Newsletter";

export type Format =
  | "Carousel"
  | "Text-motion Reel"
  | "Screen Reel"
  | "Stories"
  | "LinkedIn Post"
  | "X Thread"
  | "Newsletter";

export type Status = "Draft" | "Ready" | "Scheduled" | "Posted";

export const STATUSES: Status[] = ["Draft", "Ready", "Scheduled", "Posted"];

export interface Post {
  id: string;
  title: string;
  date: string | null; // ISO yyyy-mm-dd
  platform: Platform | null;
  format: Format | null;
  hooks: string[];
  content: string;
  imagePrompt: string;
  status: Status;
  link: string | null;
  notes: string;
  postedAt: string | null;
}
