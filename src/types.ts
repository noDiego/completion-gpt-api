import { CreateChatCompletionRequest } from 'openai/api';

/**
 * Options for configuring the ChatCompletionAPI instance.
 */
export type ChatCompletionAPIOptions = {
  /** The OpenAI API key. */
  apiKey: string;
  /** Whether to enable debug logging. */
  debug?: boolean;
  /** Optional parameters for the chat completion. */
  completionParams?: ChatCompletionOpts;
  /** The message to display from the "system" role, used to define the chat's behavior. */
  systemMessage: string;
  /** The maximum number of messages to be stored in the message history. */
  maxMessages: number;
};

/**
 * Optional parameters for controlling the completion process.
 */
export type ChatCompletionOpts = Partial<Omit<CreateChatCompletionRequest, 'messages' | 'n'>>;

/**
 * Represents a chat message with a role, content, and optional name.
 */
export interface ChatMessage {
  /** The role of the message (user, assistant, or system). */
  role: Role;
  /** The text content of the message. */
  content: string;
  /** The name of the sender of the message. */
  name?: string;
}

/**
 * Represents a message to send to the API, including its role, content, and conversation ID.
 */
export interface ChatMessageRequest {
  /** The name of the sender of the message. */
  name: string;
  /** The text content of the message. */
  text: string;
  /** An identifier that will be used to track messages sent and received. Can be any String value. Example: '123456abc' */
  conversationId: string;
  /** The role of the message (user, assistant, or system). */
  role?: Role;
  /** The message to display from the "system" role, used to define the chat's behavior. */
  systemMessage?: string;
}

/**
 * Represents a response message from the API, including its role, content, and metadata.
 */
export interface ChatResponseMessage extends ChatMessage {
  /** Metadata for the response message. */
  detail: ChatResponseDetail;
}

/**
 * Metadata for a response message, including the model and usage statistics.
 */
export interface ChatResponseDetail {
  /** The ID of the message. */
  id: string;
  /** The timestamp of when the message was created. */
  created: number;
  /** The name of the OpenAI model used for the message. */
  model: string;
  /** Optional usage statistics for the message. */
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Different message roles (user, assistant, or system).
 */
export type Role = 'user' | 'assistant' | 'system';

/**
 * Interface for caching chat messages by conversation ID.
 */
export interface ChatMessagesCache {
  /** Array of messages associated with the conversation. */
  [conversationId: string]: ChatMessage[];
}