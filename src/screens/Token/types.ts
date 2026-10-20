// src/screens/Token/types.ts
export interface Props {
  connect: (token: string) => Promise<void>;
  error: string;
}
