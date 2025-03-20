export function sanitize(unsanitized: string): string {
    // only allow a-zA-Z0-9 and hyphens
    return unsanitized.replace(/[^a-zA-Z0-9-]/g, "");
}

export function isUnsanitized(unsanitized: string): boolean {
    return unsanitized !== sanitize(unsanitized);
}