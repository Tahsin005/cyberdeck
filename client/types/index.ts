export type ButtonConfig = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
