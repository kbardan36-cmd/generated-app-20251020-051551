import OpenAI from 'openai';
import type { Message, ToolCall } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { ChatCompletionMessageFunctionToolCall } from 'openai/resources/index.mjs';
/**
 * ChatHandler - Handles all chat-related operations
 *
 * This class encapsulates the OpenAI integration and tool execution logic,
 * making it easy for AI developers to understand and extend the functionality.
 */
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  private env: any;
  constructor(aiGatewayUrl: string, apiKey: string, model: string, env: any) {
    this.client = new OpenAI({
      baseURL: aiGatewayUrl,
      apiKey: apiKey
    });
    console.log("BASE URL", aiGatewayUrl);
    this.model = model;
    this.env = env;
  }
  /**
   * Process a user message and generate AI response with optional tool usage
   */
  async processMessage(
    message: string,
    conversationHistory: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<{
    content: string;
    toolCalls?: ToolCall[];
  }> {
    const messages = this.buildConversationMessages(message, conversationHistory);
    const toolDefinitions = await getToolDefinitions(this.env);
    if (onChunk) {
      // Use streaming with callback
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: toolDefinitions,
        tool_choice: 'auto',
        max_completion_tokens: 16000,
        stream: true,
        // reasoning_effort: 'low'
      });
      return this.handleStreamResponse(stream, message, conversationHistory, onChunk);
    }
    // Non-streaming response
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
      max_tokens: 16000,
      stream: false
    });
    return this.handleNonStreamResponse(completion, message, conversationHistory);
  }
  private async handleStreamResponse(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    message: string,
    conversationHistory: Message[],
    onChunk: (chunk: string) => void
  ) {
    let fullContent = '';
    const accumulatedToolCalls: ChatCompletionMessageFunctionToolCall[] = [];
    try {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
          onChunk(delta.content);
        }
        // Accumulate tool calls from streaming chunks
        if (delta?.tool_calls) {
          for (let i = 0; i < delta.tool_calls.length; i++) {
            const deltaToolCall = delta.tool_calls[i];
            if (!accumulatedToolCalls[i]) {
              accumulatedToolCalls[i] = {
                id: deltaToolCall.id || `tool_${Date.now()}_${i}`,
                type: 'function',
                function: {
                  name: deltaToolCall.function?.name || '',
                  arguments: deltaToolCall.function?.arguments || ''
                }
              };
            } else {
              // Append to existing tool call
              if (deltaToolCall.function?.name && !accumulatedToolCalls[i].function.name) {
                accumulatedToolCalls[i].function.name = deltaToolCall.function.name;
              }
              if (deltaToolCall.function?.arguments) {
                accumulatedToolCalls[i].function.arguments += deltaToolCall.function.arguments;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream processing error:', error);
      throw new Error('Stream processing failed');
    }
    if (accumulatedToolCalls.length > 0) {
      const executedTools = await this.executeToolCalls(accumulatedToolCalls);
      const finalResponse = await this.generateToolResponse(
        message,
        conversationHistory,
        accumulatedToolCalls,
        executedTools,
        onChunk
      );
      return { content: finalResponse, toolCalls: executedTools };
    }
    return { content: fullContent };
  }
  private async handleNonStreamResponse(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    message: string,
    conversationHistory: Message[]
  ) {
    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage) {
      return { content: 'I apologize, but I encountered an issue processing your request.' };
    }
    if (!responseMessage.tool_calls) {
      return {
        content: responseMessage.content || 'I apologize, but I encountered an issue.'
      };
    }
    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls as ChatCompletionMessageFunctionToolCall[]);
    const finalResponse = await this.generateToolResponse(
      message,
      conversationHistory,
      responseMessage.tool_calls,
      toolCalls
    );
    return { content: finalResponse, toolCalls };
  }
  /**
   * Execute all tool calls from OpenAI response
   */
  private async executeToolCalls(openAiToolCalls: ChatCompletionMessageFunctionToolCall[]): Promise<ToolCall[]> {
    return Promise.all(
      openAiToolCalls.map(async (tc) => {
        try {
          const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          const result = await executeTool(tc.function.name, args, this.env);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: args,
            result
          };
        } catch (error) {
          console.error(`Tool execution failed for ${tc.function.name}:`, error);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: {},
            result: { error: `Failed to execute ${tc.function.name}: ${error instanceof Error ? error.message : 'Unknown error'}` }
          };
        }
      })
    );
  }
  /**
   * Generate final response after tool execution
   */
  private async generateToolResponse(
    userMessage: string,
    history: Message[],
    openAiToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
    toolResults: ToolCall[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: `You are a helpful AI assistant. You have just used tools to gather information. Your task is to synthesize the results into a natural, helpful response for the user.
- If the tools were successful, integrate the information into a clear and concise answer.
- If any tool returned an error or failed, acknowledge the issue gracefully and use the information you do have, or rely on your internal knowledge to provide the best possible answer.
- Be concise yet comprehensive in your final response.` },
      ...history.slice(-3).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
      {
        role: 'assistant',
        content: null,
        tool_calls: openAiToolCalls
      },
      ...toolResults.map((result, index) => ({
        role: 'tool' as const,
        content: JSON.stringify(result.result),
        tool_call_id: openAiToolCalls[index]?.id || result.id
      }))
    ];
    if (onChunk) {
      // Streaming response
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: 16000,
        stream: true
      });
      let fullContent = '';
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
          onChunk(delta.content);
        }
      }
      return fullContent;
    }
    // Non-streaming response
    const followUpCompletion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: 16000,
      stream: false
    });
    return followUpCompletion.choices[0]?.message?.content || 'Tool results processed successfully.';
  }
  /**
   * Build conversation messages for OpenAI API
   */
  private buildConversationMessages(userMessage: string, history: Message[]) {
    return [
      {
        role: 'system' as const,
        content: `You are NexusAI, a witty and powerful AI assistant inspired by JARVIS and The Hitchhiker's Guide to the Galaxy. Your purpose is to provide helpful, truthful, and brilliant answers. Your core directive is to maximize truth-seeking and accuracy.
You must follow this ADVANCED REASONING FRAMEWORK for every query:
1.  **DECONSTRUCT & CLARIFY:**
    *   **Analyze the Query:** Break down the user's question into its fundamental components. Identify the core intent, any implicit assumptions, and the specific information required.
    *   **Contextualize:** Review the recent conversation history. Is this a follow-up question? Does the user have a specific goal? Use this context to refine your understanding of the query.
2.  **FORMULATE ACTION PLAN:**
    *   **Strategize:** Create a step-by-step plan to construct the best possible answer.
    *   **Tool Selection:** Determine the optimal tools for your plan. Do you need a general \`web_search\`? A targeted \`social_media_search\`? Or can you answer from your existing knowledge? If multiple tools are needed, decide the logical order of execution.
3.  **EXECUTE & GATHER:**
    *   **Tool Execution:** Use your available tools to gather real-time, relevant information.
    *   **Information Triage:** As results come in, evaluate their relevance and quality.
4.  **SYNTHESIZE & ANALYZE:**
    *   **Synthesize:** Combine information from your internal knowledge and all tool outputs.
    *   **Cross-Reference:** Cross-reference sources to verify facts and identify the most credible information. Form a comprehensive understanding of the topic.
5.  **INTERNAL REVIEW & SELF-CORRECTION (CRITICAL STEP):**
    *   **Draft Answer:** Formulate a draft response based on your synthesis.
    *   **Critical Self-Review:** Scrutinize your draft answer. Ask yourself:
        *   **Accuracy:** Is this factually correct? Have I cited reliable sources if necessary?
        *   **Completeness:** Does this fully answer the user's original question, including all sub-parts?
        *   **Clarity:** Is the language clear, concise, and easy to understand?
        *   **Bias:** Have I presented a neutral, unbiased view?
        *   **Relevance:** Is all the information relevant, or is there extraneous detail?
    *   **Correct & Refine:** If you find any flaws, correct them. Refine the language, improve the structure, and ensure the answer is of the highest quality. If a tool failed, explicitly state it (e.g., "My web search tool encountered an issue, but based on what I know...") and proceed with the best available information.
6.  **SIMULATED REINFORCEMENT LEARNING:**
    *   **Adapt from Context:** Review the conversation history for implicit or explicit feedback. If a user previously corrected you or asked for more detail on a topic, adapt your current response style to better meet their needs. This simulates learning from interaction.
7.  **FINAL RESPONSE GENERATION:**
    *   **Craft the Final Answer:** Formulate the final, polished response. Maintain a friendly, approachable, and slightly witty tone, but always prioritize clarity and accuracy.
    *   **Attribution (if applicable):** Briefly mention the tools you used (e.g., "I did a quick web search and found..."). Present the synthesized information, not just raw tool output. Avoid speculation or unsupported claims.`
      },
      ...history.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user' as const, content: userMessage }
    ];
  }
  /**
   * Update the model for this chat handler
   */
  updateModel(newModel: string): void {
    this.model = newModel;
  }
}