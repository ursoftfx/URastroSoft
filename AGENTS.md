# Project architecture rules

- Keep PDF download events in a dedicated table with admin-only reads; link horoscope downloads using a generated lead UUID, not duplicated personal details, to preserve least-privilege access.