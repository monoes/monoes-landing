export function canDeleteOrgRun(currentUser: { id: string; role?: string }, runUploaderId: string): boolean {
  return currentUser.id === runUploaderId || currentUser.role === "admin" || currentUser.role === "moderator";
}
