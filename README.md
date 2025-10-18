📦 ReChatComponent

A fully customizable, plug-and-play React Native chat UI component with support for REST or custom fetch, pagination, and optional socket integration.

✨ Features

💬 Prebuilt, styled chat UI

🔁 Pagination with fetch-more support

🎯 Custom message rendering

🔧 REST or custom data fetchers

⚡ Optional socket integration

🧪 TypeScript types included

🖥️ Web-compatible (FlatList with headers, pull-to-refresh)

🚀 Installation
# If using from a local package:
npm install /relative/path/to/ReChatComponents

# If published on npm (replace with actual name):
npm install rechatcomponents


Ensure you have the following peer dependencies installed in your app:

"react": ">=17.0.0",
"react-native": ">=0.68.0",
"@expo/vector-icons": ">=13.0.0"

🧠 Basic Usage
import { ReChatComponent } from 'rechatcomponents';

<ReChatComponent
  url="https://your-api.com/messages"
  currentUserId={123}
  token="your-auth-token"
/>

📋 Props Reference
Prop	Type	Required	Description
url	string	✅	API endpoint to fetch messages
currentUserId	number	✅	Your app's current user ID
token	string | null	❌	Auth token for API (optional)
page	number	❌	Initial page number (default: 1)
limit	number	❌	Number of messages per fetch (default: 20)
customFetch	(page: number, limit: number) => Promise<ReChatResponse>	❌	Custom fetch function instead of default fetch(url)
formatter	(data: any) => ReChatResponse	❌	Optional formatter to reshape raw API data
useFormatter	boolean	❌	Enable custom formatter (default: false)
socket	any	❌	Optional socket instance (currently not used actively)
useSocket	boolean	❌	Socket integration flag (currently not active)
customRenderItems	({ item, index }) => JSX.Element	❌	Override default message UI
autoScrollOnMount	boolean	❌	Auto-scrolls to bottom on mount (default: true)
📤 Sending Messages

The component includes an input field and send button. By default:

Messages are added optimistically to the local list.

No API call is made to send the message.

You can modify this logic or extend it via props or sockets.

🔁 Pagination

On mount, it fetches messages using page and limit.

Scrolls to bottom automatically.

Header button Get Older Messages... loads previous pages.

📦 Response Type

Your endpoint or formatter() must return:

type ReChatResponse = {
  messages: ReChatMessage[];
  pagination: {
    page: number;
    limit: number;
    totalMessages?: number;
    totalPages?: number;
  };
}

💅 Custom Message UI

You can override the built-in chat bubble design:

<ReChatComponent
  ...
  customRenderItems={({ item }) => (
    <View>
      <Text>{item.sender_id}: {item.content}</Text>
    </View>
  )}
/>

🧾 Types
type ReChatMessage = {
  id: number;
  sender_id: number;
  content: string;
  timestamp: string;
};

🔧 Development Setup (for contributors)
# Build the package
npm run build

# Link to another project (optional dev testing)
npm link
cd your-app
npm link rechatcomponents

📘 Notes

The socket and useSocket props are placeholders. You can extend this to enable real-time updates.

The component is compatible with React Native Web, with adjusted header logic.

🛠 TODO / Future Enhancements

 Outgoing message API integration

 Incoming message via socket

 Typing indicators

 Message attachments/media

🧑‍💻 Author

Made by @vs_xd with ❤️