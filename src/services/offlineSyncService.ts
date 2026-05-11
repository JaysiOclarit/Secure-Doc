import { createRequest } from "./requestService";
import { toast } from "sonner";

interface QueuedRequest {
  id: string;
  userId: string;
  type: string;
  purpose: string;
  email?: string;
  timestamp: number;
}

const QUEUE_KEY = "secure_doc_offline_queue";

/**
 * Retrieves the current offline queue from local storage.
 */
export const getQueue = (): QueuedRequest[] => {
  const data = localStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Adds a failed request to the offline queue.
 */
export const addToQueue = (
  payload: Omit<QueuedRequest, "id" | "timestamp">,
) => {
  const queue = getQueue();
  queue.push({
    ...payload,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  toast.info(
    "You are offline. Your request has been saved and will sync automatically when your connection returns.",
    {
      duration: 6000,
    },
  );
};

/**
 * Attempts to process all queued requests.
 */
export const syncOfflineQueue = async () => {
  const queue = getQueue();
  if (queue.length === 0) return;

  toast.loading(`Syncing ${queue.length} offline request(s)...`);

  const remainingQueue: QueuedRequest[] = [];
  let successCount = 0;

  for (const req of queue) {
    try {
      await createRequest(req.userId, req.type, req.purpose, req.email);
      successCount++;
    } catch (err) {
      // If it fails again (e.g., server error), keep it in the queue for later
      remainingQueue.push(req);
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));

  if (successCount > 0) {
    toast.success(`Successfully synced ${successCount} offline request(s)!`);
  }
};

/**
 * Initializes the global network listeners.
 */
export const initOfflineSync = () => {
  // Listen for the browser's native 'online' event
  window.addEventListener("online", () => {
    syncOfflineQueue();
  });
};
