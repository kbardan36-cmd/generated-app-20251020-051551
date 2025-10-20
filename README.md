# NexusAI
A witty and powerful AI assistant inspired by JARVIS and The Hitchhiker's Guide to the Galaxy, designed for conversation, search, and content generation.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/kbardan36-cmd/generated-app-20251020-051429)
## About The Project
NexusAI is a sophisticated, witty, and highly capable AI assistant designed to be a user's central hub for information, creativity, and task execution. Inspired by the helpfulness of The Hitchhiker's Guide to the Galaxy and the advanced intelligence of JARVIS, NexusAI provides a seamless conversational experience.
The application features a stunning, professional light-themed interface with a persistent sidebar for managing multiple conversations. At its core is an **advanced reasoning engine** that deconstructs user queries, formulates strategic plans, and performs internal self-correction to ensure responses are accurate, comprehensive, and reliable. The agent adapts its behavior based on conversational context, simulating a learning process to improve over time. Users can ask questions, get real-time information from the web and social media, and generate artifacts like code snippets and documents, all while interacting with an AI that prioritizes truth-seeking and intellectual rigor.
**Note:** To ensure fair usage, there is a limit on the number of requests that can be made to the AI servers across all user apps in a given time period.
## Key Features
-   **Advanced Reasoning Engine:** Employs a multi-step reasoning framework for each query: deconstruction, strategic planning, tool execution, information synthesis, and a critical self-correction loop to ensure high-quality answers.
-   **Advanced Conversational AI:** Engages in natural, context-aware conversations, adapting its responses based on user feedback and interaction history to provide more relevant and brilliant answers.
-   **Comprehensive Web & Social Media Search:** Utilizes powerful search tools to provide up-to-date, well-rounded answers from across the internet.
-   **Robust Error Handling:** Gracefully manages tool failures to always provide a helpful response.
-   **Streaming Responses:** AI responses are streamed token-by-token for a real-time feel.
-   **Session Management:** Easily create, switch between, rename, and delete multiple conversations.
-   **Markdown & Code Rendering:** Rich text formatting and syntax highlighting for code snippets, complete with a one-click copy button.
-   **Polished UI/UX:** A visually stunning, responsive light theme with fluid animations and a clean, professional aesthetic.
-   **Serverless Architecture:** Built on a robust, scalable serverless backend using Cloudflare Workers and Durable Objects.
## Technology Stack
-   **Frontend:**
    -   React & Vite
    -   Tailwind CSS
    -   shadcn/ui
    -   Framer Motion for animations
    -   Zustand for state management
    -   Lucide React for icons
-   **Backend:**
    -   Cloudflare Workers
    -   Hono web framework
    -   Cloudflare Agents SDK (built on Durable Objects)
-   **AI & Integration:**
    -   Cloudflare AI Gateway
    -   OpenAI SDK
-   **Language:** TypeScript
## Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites
-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/) package manager
-   A Cloudflare account
### Installation & Setup
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/nexus_ai_assistant.git
    cd nexus_ai_assistant
    ```
2.  **Install dependencies:**
    ```sh
    bun install
    ```
3.  **Configure Environment Variables:**
    Create a `.dev.vars` file in the root of the project and add your Cloudflare AI Gateway and SerpApi credentials.
    ```ini
    # .dev.vars
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"
    SERPAPI_KEY="YOUR_SERPAPI_API_KEY" # Required for web search tool
    ```
    Replace the placeholder values with your actual credentials.
### Running Locally
To start the development server, which includes the Vite frontend and the Wrangler dev server for the worker, run:
```sh
bun dev
```
The application will be available at `http://localhost:3000`.
## Deployment
This project is designed for easy deployment to Cloudflare's global network.
1.  **Login to Cloudflare:**
    If you haven't already, authenticate Wrangler with your Cloudflare account.
    ```sh
    bunx wrangler login
    ```
2.  **Deploy the application:**
    Run the deploy script, which will build the application and deploy it to your Cloudflare account.
    ```sh
    bun deploy
    ```
    After deployment, Wrangler will provide you with the URL to your live application.
Alternatively, you can deploy directly from your GitHub repository with a single click.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/kbardan36-cmd/generated-app-20251020-051429)
## Project Structure
-   `src/`: Contains all the frontend React application code.
    -   `components/`: Reusable UI components.
    -   `hooks/`: Custom React hooks.
    -   `lib/`: Utility functions and services.
    -   `pages/`: Main page components.
-   `worker/`: Contains all the backend Cloudflare Worker and Agent code.
    -   `agent.ts`: The core `ChatAgent` Durable Object class.
    -   `chat.ts`: Handles AI model interaction and tool logic.
    -   `userRoutes.ts`: Defines the API routes for the application.
-   `wrangler.jsonc`: Configuration file for the Cloudflare Worker.
## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
## License
Distributed under the MIT License. See `LICENSE` for more information.
//