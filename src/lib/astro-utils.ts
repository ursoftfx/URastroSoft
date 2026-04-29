export const norm360 = (d: number): number => {
  d = d % 360;
  return d < 0 ? d + 360 : d;
};
