/** react-helmet-async supports nonce in context; upstream types omit it. */
export function getHelmetProviderContext(nonce: string | undefined): { nonce?: string } {
  return nonce ? { nonce } : {}
}
