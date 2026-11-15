export const NOTICE_KEY = 'foodie:welcome:20261115:hidden-until'
export const NOTICE_SESSION_KEY = 'foodie:welcome:20261115:dismissed'
export const NOTICE_DAY = 24 * 60 * 60 * 1000
export function isNoticeHidden(value: string | null, now: number) {
  const until = Number(value)
  return Number.isFinite(until) && until > now && until <= now + NOTICE_DAY
}
