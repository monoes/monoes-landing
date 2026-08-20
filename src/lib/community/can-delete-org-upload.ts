export function canDeleteOrgUpload(currentUser: { id: string; role?: string }, uploaderId: string): boolean {
  return currentUser.id === uploaderId || currentUser.role === "admin" || currentUser.role === "moderator";
}
