import { router, type Href } from 'expo-router';

/**
 * Goes back, or to `fallback` when there is nowhere to go back to. On web a screen can be opened
 * directly (page reload, home-screen app restored on a sub-page), and then router.back() does nothing.
 */
export function goBack(fallback: Href = '/'): void {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
