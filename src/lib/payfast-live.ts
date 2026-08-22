/**
 * Pre-PayFast honest state.
 *
 * PayFast has not yet been configured with Des's real, verified merchant
 * account — the site currently only has PayFast's own generic sandbox test
 * credentials wired in, which is fine for developer testing but would show a
 * real visitor a confusing "sandbox test buyer login" screen if they tried to
 * pay. Until `PAYFAST_LIVE=true` is set (after real credentials are added and
 * tested — see LAUNCH_ME_FIRST.md), the site never claims live payment is
 * available: purchase requests reserve the artwork and hand off to Des to
 * arrange payment directly, instead of redirecting to PayFast at all.
 */
export function isPayfastLive(): boolean {
  return process.env.PAYFAST_LIVE === 'true';
}
