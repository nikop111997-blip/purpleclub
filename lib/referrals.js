import crypto from "crypto";

/**
 * Generate a secure invitation token.
 * This token is sent to the guest in the invite URL.
 */
export function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash invitation token before storing it in MongoDB.
 */
export function hashInviteToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}