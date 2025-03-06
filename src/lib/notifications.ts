export type Notification = {
    message: string,
    success: boolean,
    status?: string
}

let outstandingNotifications: Notification[] = [];

export function addNotification(notif: Notification) {
    outstandingNotifications.push(notif);
}

export function retrieveNotifications(): Notification[] {
    const previousNotifications = [...outstandingNotifications];
  
    // Clear the original list.
    outstandingNotifications = [];
  
    // Return the copy.
    return previousNotifications;
  }