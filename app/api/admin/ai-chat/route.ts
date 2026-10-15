import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      messages,
      apiKey: clientApiKey,
      model = process.env.NVIDIA_MODEL || 'meta/muse-glimmer-30b',
      temperature = 1,
      top_p = 0.95,
      max_tokens = 8192,
      context = ''
    } = body as {
      prompt?: string;
      messages?: Array<{ role: string; content: string }>;
      apiKey?: string;
      model?: string;
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      context?: string;
    };

    const apiKey =
      clientApiKey?.trim() ||
      process.env.NVIDIA_API_KEY ||
      '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';

    const baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';

    // Construct messages array
    let chatMessages: Array<{ role: string; content: string }> = [];

    if (messages && messages.length > 0) {
      chatMessages = [...messages];
    } else if (prompt) {
      if (context) {
        chatMessages.push({
          role: 'system',
          content: `You are the Executive AI Intelligence Copilot for Drobe's Quick-Commerce Darkstore operating in Ahmedabad.
Drobe offers 30-minute rapid delivery and 6-minute doorstep fitting trials.
You have access to live darkstore operations, user telemetry, inventory zones, and wholesale settlements.
When answering operational questions, use this live context:
${context}`
        });
      }
      chatMessages.push({
        role: 'user',
        content: prompt
      });
    } else {
      return NextResponse.json(
        { error: 'Prompt or messages array is required.' },
        { status: 400 }
      );
    }

    const apiUrl = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature,
        top_p,
        max_tokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API Error:', response.status, errorText);
      return NextResponse.json(
        {
          error: `NVIDIA API error: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const choice = data?.choices?.[0];
    const message = choice?.message;

    const content = message?.content ?? null;
    const reasoningContent = message?.reasoning_content ?? null;

    return NextResponse.json({
      success: true,
      content: content || reasoningContent || 'No output generated.',
      reasoning: reasoningContent,
      model: data?.model || model,
      finish_reason: choice?.finish_reason,
      usage: data?.usage
    });
  } catch (error: any) {
    console.error('Failed to process AI chat completion:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error while calling NVIDIA API'
      },
      { status: 500 }
    );
  }
}
