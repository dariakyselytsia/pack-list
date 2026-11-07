import type { Timestamp } from 'firebase/firestore';

export type ListId = 'her' | 'his';
export const LIST_IDS: readonly ListId[] = ['her', 'his'];

export interface Item {
  id: string;
  text: string;
  sub: boolean;
  done: boolean;
}

export interface Section {
  id: string;
  sym: string;
  title: string;
  note: string;
  items: Item[];
}

export interface PackList {
  name: string;
  theme: ListId;
  sections: Section[];
  updatedAt: Timestamp | null;
}

export type Mode = ListId | 'both';
