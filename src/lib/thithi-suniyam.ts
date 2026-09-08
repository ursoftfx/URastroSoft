// திதி சூன்யம் • இறந்த ராசி • முடக்கு ராசி helpers

/** tithi (1..15 within paksha) -> shunya rasi indices (0=மேஷம்) */
export const TITHI_SUNIYAM: Record<number, number[]> = {
  1: [8, 11], 9: [8, 11],
  2: [9, 10], 10: [9, 10],
  3: [0, 7], 11: [0, 7],
  4: [1, 6], 12: [1, 6],
  5: [2, 5], 13: [2, 5],
  6: [3, 4], 14: [3, 4],
  7: [10, 11], 15: [10, 11],
  8: [9, 8],
};

export const tithiInPaksha = (tithiIndex: number) => (tithiIndex % 15) + 1;

export const suniyaRasisFor = (tithiIndex: number): number[] =>
  TITHI_SUNIYAM[tithiInPaksha(tithiIndex)] ?? [];

/** 8th rasi from janma rasi */
export const irundhaRasi = (janmaRasi: number) => (janmaRasi + 7) % 12;

/** 12th rasi from janma rasi */
export const mudakkuRasi = (janmaRasi: number) => (janmaRasi + 11) % 12;
