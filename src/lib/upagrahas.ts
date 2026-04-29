// Upagrahas (Apaprakash & Upa grahas)
// Computed from Sun's longitude using classical offsets (Parashara)
// Also Saturn-based: Mandi/Gulika (already in jathagam.ts)

export interface UpagrahaPos {
  key: string;
  name: string;
  longitude: number;
  rasiIndex: number;
}

// Offsets from Sun's longitude (in degrees) — classical Parashara values
// Dhuma = Sun + 133°20'
// Vyatipata = 360° - Dhuma  (i.e. opposite side)
// Parivesha = Vyatipata + 180°
// Indrachapa = 360° - Parivesha
// Upaketu = Indrachapa + 16°40'
const norm = (d: number): number => ((d % 360) + 360) % 360;

export function computeUpagrahas(sunLon: number): UpagrahaPos[] {
  const dhuma = norm(sunLon + 133 + 20 / 60);
  const vyatipata = norm(360 - dhuma);
  const parivesha = norm(vyatipata + 180);
  const indrachapa = norm(360 - parivesha);
  const upaketu = norm(indrachapa + 16 + 40 / 60);

  const make = (key: string, name: string, lon: number): UpagrahaPos => ({
    key, name, longitude: lon, rasiIndex: Math.floor(lon / 30),
  });

  return [
    make("dhuma", "தூம", dhuma),
    make("vyatipata", "வ்யதீபாதம்", vyatipata),
    make("parivesha", "பரிவேஷம்", parivesha),
    make("indrachapa", "இந்திரசாபம்", indrachapa),
    make("upaketu", "உபகேது", upaketu),
  ];
}
