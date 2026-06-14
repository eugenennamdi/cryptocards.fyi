// The verified wallet addresses for the site administrators/contributors.
// Stealth Admin Mode relies on this list to unlock moderation tools.
export const ADMIN_WALLETS = [
  '0x5c53414E1f15D7668c2b9EC0A92482A64845f5f6'
];

/**
 * Validates if a given wallet address belongs to an authorized admin.
 * Performs a case-insensitive check against the whitelist.
 */
export function isAuthorizedAdmin(address?: string | null): boolean {
  if (!address) return false;
  const lowerCaseAddress = address.toLowerCase();
  return ADMIN_WALLETS.some(admin => admin.toLowerCase() === lowerCaseAddress);
}
