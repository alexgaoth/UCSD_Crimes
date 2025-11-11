/**
 * Web Push Notification Service
 * Handles browser notifications for UCSD Crime Alerts
 */

/**
 * Check if notifications are supported by the browser
 */
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

/**
 * Check current notification permission status
 * @returns {'granted' | 'denied' | 'default'}
 */
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Request notification permission from the user
 * @returns {Promise<'granted' | 'denied' | 'default'>}
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported');
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    throw error;
  }
};

/**
 * Generate a unique browser ID for tracking subscriptions
 * This creates a simple UUID stored in localStorage
 */
export const getBrowserId = () => {
  let browserId = localStorage.getItem('browser_id');

  if (!browserId) {
    // Generate a simple UUID v4
    browserId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    localStorage.setItem('browser_id', browserId);
  }

  return browserId;
};

/**
 * Send a welcome/test notification to confirm subscription
 */
export const sendTestNotification = () => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Cannot send notification: permission not granted');
    return false;
  }

  try {
    const notification = new Notification('UCSD Crime Alerts', {
      body: "You're subscribed! You'll be notified of new reports.",
      icon: '/UCSD_Crimes/header-logo1.png',
      badge: '/UCSD_Crimes/header-logo1.png',
      tag: 'welcome-notification',
      requireInteraction: false
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Handle notification click
    notification.onclick = function(event) {
      event.preventDefault();
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

/**
 * Send notification for a new crime report
 * @param {Object} report - Crime report object
 */
export const sendCrimeReportNotification = (report) => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Cannot send notification: permission not granted');
    return false;
  }

  try {
    const title = `New ${report.category} Report`;
    const body = `${report.location} - ${report.date_occurred || 'Recently'}`;

    const notification = new Notification(title, {
      body: body,
      icon: '/UCSD_Crimes/header-logo1.png',
      badge: '/UCSD_Crimes/header-logo1.png',
      tag: `crime-${report.incident_case || Date.now()}`,
      requireInteraction: true,
      data: {
        url: window.location.origin + '/UCSD_Crimes/#/',
        caseNumber: report.incident_case
      }
    });

    // Handle notification click - open the app
    notification.onclick = function(event) {
      event.preventDefault();
      window.focus();
      notification.close();

      // Navigate to home page if possible
      if (window.location.pathname !== '/UCSD_Crimes/' && window.location.pathname !== '/UCSD_Crimes') {
        window.location.href = '/UCSD_Crimes/#/';
      }
    };

    return true;
  } catch (error) {
    console.error('Error sending crime report notification:', error);
    return false;
  }
};

/**
 * Check if user is subscribed to notifications
 * @returns {boolean}
 */
export const isSubscribed = () => {
  const notificationsEnabled = localStorage.getItem('notificationsEnabled');
  const permission = getNotificationPermission();

  return notificationsEnabled === 'true' && permission === 'granted';
};

/**
 * Subscribe to notifications
 * Stores subscription status in localStorage
 */
export const subscribe = () => {
  localStorage.setItem('notificationsEnabled', 'true');
  localStorage.setItem('notificationSubscribedAt', new Date().toISOString());
};

/**
 * Unsubscribe from notifications
 * Removes subscription status from localStorage
 */
export const unsubscribe = () => {
  localStorage.removeItem('notificationsEnabled');
  localStorage.removeItem('notificationSubscribedAt');
  localStorage.removeItem('lastReportCheckTime');
};

/**
 * Get instructions for enabling notifications based on browser
 * @returns {string}
 */
export const getEnableInstructions = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('chrome')) {
    return 'Click the lock icon in the address bar, then select "Site settings" and enable notifications.';
  } else if (userAgent.includes('firefox')) {
    return 'Click the lock icon in the address bar, then click "More information" and enable notifications in the Permissions tab.';
  } else if (userAgent.includes('safari')) {
    return 'Go to Safari > Settings > Websites > Notifications and allow notifications for this site.';
  } else if (userAgent.includes('edge')) {
    return 'Click the lock icon in the address bar, select "Permissions for this site" and enable notifications.';
  } else {
    return 'Check your browser settings to enable notifications for this site.';
  }
};

/**
 * Check for new reports and send notifications
 * This should be called periodically (e.g., every 5 minutes)
 * @param {Array} latestReports - Array of latest crime reports
 */
export const checkForNewReportsAndNotify = (latestReports) => {
  if (!isSubscribed()) {
    return;
  }

  const lastCheckTime = localStorage.getItem('lastReportCheckTime');
  const currentTime = new Date().toISOString();

  if (!lastCheckTime) {
    // First time checking, just store the current time
    localStorage.setItem('lastReportCheckTime', currentTime);
    return;
  }

  // Filter reports that are newer than last check
  const newReports = latestReports.filter(report => {
    const reportTime = new Date(report.date_rept || report.created_at);
    return reportTime > new Date(lastCheckTime);
  });

  // Send notification for each new report (limit to 3 to avoid spam)
  const reportsToNotify = newReports.slice(0, 3);
  reportsToNotify.forEach(report => {
    sendCrimeReportNotification(report);
  });

  // If there are more than 3 new reports, send a summary notification
  if (newReports.length > 3) {
    if (getNotificationPermission() === 'granted') {
      new Notification('UCSD Crime Alerts', {
        body: `${newReports.length} new crime reports added. Click to view.`,
        icon: '/UCSD_Crimes/header-logo1.png',
        badge: '/UCSD_Crimes/header-logo1.png',
        tag: 'summary-notification',
        requireInteraction: true
      }).onclick = function(event) {
        event.preventDefault();
        window.focus();
        this.close();
      };
    }
  }

  // Update last check time
  localStorage.setItem('lastReportCheckTime', currentTime);
};

/**
 * Initialize notification system on app load
 * Checks permissions and syncs with browser state
 * Note: Service Worker is automatically registered by vite-plugin-pwa
 */
export const initializeNotifications = async () => {
  // Check if notifications are supported
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  // Sync localStorage with actual permission state
  const permission = getNotificationPermission();
  const storedEnabled = localStorage.getItem('notificationsEnabled');

  if (storedEnabled === 'true' && permission !== 'granted') {
    // Permission was revoked in browser settings
    unsubscribe();
    console.log('Notification permission revoked, unsubscribed');
  }

  return true;
};
