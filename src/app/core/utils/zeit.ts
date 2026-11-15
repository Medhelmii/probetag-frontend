const ZONE = 'Europe/Berlin';

const stundenFormat = new Intl.DateTimeFormat('de-DE', {
    timeZone: ZONE,
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
});

/** "2026-11-24T07:00:00Z" -> 8 (bzw. 8.5 für 8:30), in deutscher Zeit. */
export function stundeInBerlin(iso: string): number {
    const teile = stundenFormat.formatToParts(new Date(iso));
    const stunde = Number(teile.find((t) => t.type === 'hour')?.value ?? 0);
    const minute = Number(teile.find((t) => t.type === 'minute')?.value ?? 0);
    return stunde + minute / 60;
}

/** 8.5 -> "8:30", 15 -> "15:00", 24.33 -> "0:20" (nach Mitternacht) */
export function alsUhrzeit(stunde: number): string {
  const h = Math.floor(stunde) % 24;
  const m = Math.round((stunde - Math.floor(stunde)) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
}
const datumFormat = new Intl.DateTimeFormat('de-DE', {
    timeZone: ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
});

/** "2026-11-24T07:00:00Z" -> "Dienstag, 24. November" */
export function datumLang(iso: string): string {
    return datumFormat.format(new Date(iso));
}