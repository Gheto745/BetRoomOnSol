import { create } from "zustand"

interface CoinsState {
  coins: number
  addCoins: (amount: number) => void
  removeCoins: (amount: number) => void
  hasEnoughCoins: (amount: number) => boolean
}

export const useCoins = create<CoinsState>((set, get) => ({
  coins: 100,
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  removeCoins: (amount) => set((state) => ({ coins: Math.max(0, state.coins - amount) })),
  hasEnoughCoins: (amount) => get().coins >= amount,
}))

