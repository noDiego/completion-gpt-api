
# CompletionGPT API

A Node.js library that simplifies the process of generating completions for chat messages, tracks message history, and allows for saving and importing previous message history. It uses OpenAI's GPT-3 API. Currently, the library only supports chat completions.

## Installation

Install my-project with npm

```bash
npm install completion-gpt-api
```

## Usage/Examples

Creating an instance of the API

```javascript
import { ChatCompletionAPI } from 'completion-gpt-api';

const apiKey = 'YOUR_API_KEY';
const completionAPI = new ChatCompletionAPI({ apiKey });
```

### Constructor Options
The ChatCompletionAPI constructor accepts the following options:

`apiKey` (required): Your OpenAI API key.

`debug` (optional, default false): A boolean flag that controls whether debug information is printed to the console during runtime.

`completionParams` (optional): An object containing options to be passed to the OpenAI API's createChatCompletion method. See the OpenAI API documentation for more information on the available options.

`systemMessage` (optional, default 'You are a helpful assistant.'): A string that will be used as the system message for each chat session.

`maxMessages` (optional, default 100): The maximum number of messages to store in the message history for each chat session. If the message history exceeds this limit, the oldest messages will be discarded to make room for new ones.

## Sending a message and getting the response
```javascript
const messageRequest: ChatMessageRequest = {
  name: 'John',
  text: 'Hi, how are you?',
  conversationId: '38523905723',
};

const responseMessage: ChatResponseMessage = 
  await completionAPI.sendMessage(messageRequest);
```

### ChatMessageRequest:

`name` (string): The name of the user sending the message.

`text` (string): The text of the message being sent.

`conversationId` (string): An identifier that will be used to track messages sent and received. Can be any String value.

`role` (Role enum, optional): The role of the user sending the message. Defaults to Role.USER.
`systemMessage` (string, optional): The system message to include in the response. Defaults to the value set in the constructor.

### ChatCompletionOpts:

`model` (string, optional): The name of the GPT model to use for completion. Defaults to 'gpt-3.5-turbo'.

`temperature` (number, optional): Controls the randomness of the generated text. Higher values generate more random text. Defaults to 0.8.

`top_p` (number, optional): Controls the diversity of the generated text. Higher values generate more diverse text. Defaults to 1.0.

`presence_penalty` (number, optional): Controls how much the model should avoid repeating text from the input. Higher values generate more novel text. Defaults to 1.0.

`stop` (string[], optional): An array of strings to use as stop sequences to prevent the model from generating text beyond a certain point.

`frequencyPenalty` (number, optional): Controls how much the model should avoid repeating itself in generated text. Higher values generate more diverse text. Defaults to 0.0.

`bestOf` (number, optional): Controls how many completions to generate and return. Higher values generate more diverse text. Defaults to 1.

### ChatResponseMessage:

`content` (string): The content of the message.

`detail` (ChatResponseDetail): Details about the response from the OpenAI API.

`role` (Role enum): The role of the user who sent the message.

## Retrieving the message history
```javascript
const conversationId = '12345';

const messageHistory = completionAPI.getMessageHistory(conversationId);
console.log(messageHistory);
```

## Note: 
#### The message history is stored in memory and will only persist for the duration of the process. If you need to retain message history for future sessions, you will need to save it to a file or database (getting it with `getMessageHistory`) and then load it into memory when starting a new session (with `setMessageHistory`).

## Updating the message history
```javascript
const conversationId = '12345';
const messageHistory = [
  {
    name: 'John',
    role: 'user',
    content: 'Hi, how are you?',
  },
  {
    role: 'assistant',
    content: 'I am doing well, thank you for asking.',
  },
];

completionAPI.setMessageHistory(conversationId, messageHistory);
```

The `sendMessage` method takes a `ChatMessageRequest` object and an optional `ChatCompletionOpts` object. The `ChatMessageRequest` object contains the `name`, `text`, `conversationId`, and role properties of the message. The `ChatCompletionOpts` object contains any optional completion parameters that you want to pass to the OpenAI API.

The `getMessageHistory` method retrieves the message history for a given conversation ID. The `setMessageHistory` method allows you to update the message history for a given conversation ID.

The message history is stored in a cache using a `ChatMessagesCache` object, which is an object that maps conversation IDs to arrays of `ChatMessage` objects. Each `ChatMessage` object represents a message in the conversation and has a `role` property (which is one of the `Role` enum values), a `name` property (which is optional and represents the name of the user who sent the message), and a `content` property (which contains the text of the message).

## Example
```javascript
import { ChatCompletionAPI, ChatMessageRequest, Role } from 'chat-completion-api';

const apiKey = 'your_openai_api_key';
const conversationId = 'some_conversation_id';

const chat = new ChatCompletionAPI({
  apiKey: apiKey,
  maxMessages: 100,
  systemMessage: 'You are a helpful assistant',
});

// Obtain chat message history from a database or other source
const messageHistory = [
  { name: 'User', role: 'user', content: 'Hi, how are you?' },
  { name: 'Assistant', role: 'assistant', content: 'I am doing well, thank you. How can I assist you today?' }
];

// Set message history for the conversation
chat.setMessageHistory(conversationId, messageHistory);

// Send a chat message
const messageRequest: ChatMessageRequest = {
  name: 'User',
  text: 'Can you help me troubleshoot my computer?',
  conversationId: conversationId,
  role: 'user',
};
const response = await chat.sendMessage(messageRequest);

console.log(`Response: ${response.content}`);

// Get updated message history
const updatedMessageHistory = chat.getMessageHistory(conversationId);
console.log(updatedMessageHistory);
```

### Note (for Typescript)
If you encounter an error with the openai library, you may need to add "dom" to the "lib" property in your tsconfig.json file's "compilerOptions". This is because the openai library depends on some DOM-specific types that may not be included by default in your TypeScript configuration. Adding "dom" to the "lib" property will ensure that these types are included and should resolve any related compilation errors.