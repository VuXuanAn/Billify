import { create } from 'zustand';

interface BillState {
  step: "landing" | "setup" | "editor";
  groupName: string;
  setupMembers: string[];
  currentData: any; // Ideally we type this based on BillTable's Data type
  setStep: (step: "landing" | "setup" | "editor") => void;
  setGroupName: (name: string) => void;
  setSetupMembers: (members: string[]) => void;
  setCurrentData: (data: any) => void;
  reset: () => void;
}

export const useBillStore = create<BillState>((set) => ({
  step: "landing",
  groupName: "",
  setupMembers: [],
  currentData: null,
  setStep: (step) => set({ step }),
  setGroupName: (groupName) => set({ groupName }),
  setSetupMembers: (setupMembers) => set({ setupMembers }),
  setCurrentData: (currentData) => set({ currentData }),
  reset: () => set({
    step: "landing",
    groupName: "",
    setupMembers: [],
    currentData: null,
  }),
}));
