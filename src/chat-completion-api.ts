import { Configuration, OpenAIApi } from "openai";
import { CreateChatCompletionRequest } from 'openai/api';
import { ChatCompletionAPIOptions, ChatCompletionOpts, ChatMessage, ChatMessageRequest, ChatMessagesCache, ChatResponseMessage, Role } from './types';
import { CompletionError } from './exceptions/completion-error';

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_MAX_MESSAGES = 100;
const DEFAULT_SYSTEM_MESSAGE = 'You are a helpful assistant.';

export class ChatCompletionAPI {

  private openai: OpenAIApi;
  private _messagesCache: ChatMessagesCache;
  protected _completionParams: Omit<CreateChatCompletionRequest, 'messages' | 'n'>;
  protected _systemMessage: string;
  protected _debug: boolean;
  protected _apiKey: string;
  protected _maxMessages: number;

  /**

   Creates a new instance of ChatCompletionAPI.
   @param {ChatCompletionAPIOptions} opts - The options to configure the instance.
   @param {string} opts.apiKey - The OpenAI API key.
   @param {boolean} [opts.debug=false] - Whether to enable debug logging.
   @param {ChatCompletionOpts} [opts.completionParams] - Optional parameters for the chat completion.
   @param {string} [opts.systemMessage=DEFAULT_SYSTEM_MESSAGE] - The message to display from the "system" role, used to define the chat's behavior.
   @param {number} [opts.maxMessages=DEFAULT_MAX_MESSAGES] - The maximum number of messages to be stored in the message history.
   @throws {Error} If apiKey is not provided.
   */
  constructor(opts: ChatCompletionAPIOptions) {
    const {
      apiKey,
      debug = false,
      completionParams,
      systemMessage = DEFAULT_SYSTEM_MESSAGE,
      maxMessages = DEFAULT_MAX_MESSAGES
    } = opts

    this._completionParams = {
      model: DEFAULT_MODEL,
      temperature: 0.8,
      top_p: 1.0,
      presence_penalty: 1.0,
      ...completionParams
    }

    this._messagesCache = {};
    this._systemMessage = systemMessage;
    this._debug = debug;
    this._apiKey = apiKey;
    this._maxMessages = maxMessages;

    if (!this._apiKey) throw new Error('OpenAI missing required apiKey');

    const configuration = new Configuration({
      apiKey: this._apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Sends a chat message to the API and returns the response message.
   *
   * @param chatRequest - The request object containing the name, text, conversation ID, role, and optional system message.
   * @param opts - Optional completion parameters to use for this message only.
   * @returns A Promise that resolves to the response message from the API.
   * @throws {CompletionError} If there is an error with the API request or response.
   */
  public async sendMessage(
    chatRequest: ChatMessageRequest,
    opts?: ChatCompletionOpts
  ): Promise<ChatResponseMessage> {

    const {
      name,
      text,
      conversationId,
      role = 'user',
      systemMessage,
    } = chatRequest;

    const chatCompletionRequest: CreateChatCompletionRequest = this.buildMessage(conversationId, {
      name: name,
      content: text,
      role: role,
      ...opts
    }, systemMessage);

    try {
      const completion = await this.openai.createChatCompletion(chatCompletionRequest);

      if (this._debug) console.log(JSON.stringify(completion));

      if (!completion.data?.choices[0]?.message) {
        throw new CompletionError(completion.statusText);
      }

      //Se guarda el mensaje enviado en el caché
      this.getMessageHistory(conversationId).push({
        content: text,
        name: name,
        role: role
      });
      //Se guarda el mensaje recibido en el caché
      this.getMessageHistory(conversationId).push({
        content: completion.data.choices[0].message.content,
        role: completion.data.choices[0].message.role as Role
      });

      return {
        content: completion.data.choices[0].message.content,
        detail: completion.data,
        role: completion.data.choices[0].message.role as Role
      }
    } catch (e: any) {
      if (this._debug) console.log(e);
      throw new CompletionError(e.message, e.type, e.param, e.code);
    }
  }

  /**

   Returns the chat message history for a given conversationId, limited to the maximum number of messages set in maxMessages.
   @param conversationId The conversationId that was defined to send messages.
   @returns An array of chat messages representing the conversation history.
   */
  public getMessageHistory(conversationId: string): ChatMessage[] {
    const maxMessages = this._maxMessages - 1;
    this._messagesCache[conversationId] = this._messagesCache[conversationId] || [];
    const messageHistory = this._messagesCache[conversationId];
    return messageHistory.length > maxMessages ? messageHistory.slice(-maxMessages) : messageHistory;
  }

  /**
   * Sets the message history for a given conversationId.
   *
   * @param conversationId - The conversationId that was defined to send messages.
   * @param messageHistory - The message history to set for the conversation.
   */
  public setMessageHistory(conversationId: string, messageHistory: ChatMessage[]) {
    this._messagesCache[conversationId] = messageHistory;
  }

  private buildMessage(conversationId: string, message: ChatMessage, systemMessage: string = this._systemMessage): CreateChatCompletionRequest {

    const messagesInput: ChatMessage[] = [];

    //Se agrega mensaje de System
    messagesInput.push({content: systemMessage, role: 'system'});

    //Se agregan mensajes previos
    for (const msg of this.getMessageHistory(conversationId)) {
      messagesInput.push({name: msg.name, role: msg.role, content: msg.content});
    }

    messagesInput.push({name: message.name, role: message.role || 'user', content: message.content});

    return {
      model: this._completionParams.model,
      messages: messagesInput
    };
  }

}
