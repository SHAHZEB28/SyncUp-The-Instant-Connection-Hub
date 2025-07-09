// src/data/chatdata.ts
// This file centralizes all data-related definitions.

// --- TYPES --- //

/**
 * Represents a user in the chat application.
 */
export type User = {
  id: string;
  name: string;
  avatar: string;
};

/**
 * Represents a single chat message.
 * THE FIX: Added an optional 'type' property to distinguish between user and system messages.
 */
export type Message = {
  id: string | number;
  text: string;
  sender: User;
  timestamp: string;
  type?: 'user' | 'system'; // 'user' is default, 'system' for special messages
};
