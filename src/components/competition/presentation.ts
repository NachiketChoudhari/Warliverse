export type FullscreenResult = { ok: true } | { ok: false; reason: 'unsupported' | 'denied' };

export async function requestPresentationFullscreen(
  element: { requestFullscreen?: () => Promise<void> } | null,
): Promise<FullscreenResult> {
  if (!element?.requestFullscreen) return { ok: false, reason: 'unsupported' };
  try {
    await element.requestFullscreen();
    return { ok: true };
  } catch {
    return { ok: false, reason: 'denied' };
  }
}

