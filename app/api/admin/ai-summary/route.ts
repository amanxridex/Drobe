import { NextResponse } from 'next/server';
import { 
  DrobeUserActivity, 
  DrobeUserProfile, 
  DrobeAIShopperReport, 
  generateHeuristicAIShopperReport 
} from '@/app/lib/darkstoreData';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      apiKey: clientApiKey, 
      activities = [], 
      users = [] 
    } = body as {
      apiKey?: string;
      activities: DrobeUserActivity[];
      users: DrobeUserProfile[];
    };

    const apiKey =
      clientApiKey?.trim() ||
      process.env.NVIDIA_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      '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';

    // Filter drop-off signals to give LLM direct high-signal context
    const dropoffActivities = (activities as DrobeUserActivity[]).filter(
      a => a.isDropoffSignal || 
           a.activityType === 'CHECKOUT_BACKOUT' || 
           a.activityType === 'CART_ABANDON' || 
           a.activityType === 'PRICE_HESITATION' || 
           a.activityType === 'SIZE_UNAVAILABLE' ||
           a.activityType === 'DOORSTEP_TIMER_ANXIETY'
    );

    const highRiskUsers = (users as DrobeUserProfile[]).filter(
      u => u.dropoffRisk === 'High' || u.dropoffRisk === 'Immediate Dropoff'
    );

    // If an API key is available, call NVIDIA NIM (meta/muse-glimmer-30b), Gemini, or OpenAI
    if (apiKey) {
      try {
        const isNvidia = apiKey.startsWith('nvapi-') || (!apiKey.startsWith('AIza') && !apiKey.startsWith('sk-'));
        const isGemini = apiKey.startsWith('AIza');
        const isOpenAi = apiKey.startsWith('sk-');

        const prompt = `You are Drobe's E-Commerce Behavioral Intelligence Engine analyzing real-time shopper telemetry from the Ahmedabad Quick-Commerce Darkstore.
Drobe provides ultra-fast 30-minute delivery with 6-minute doorstep fitting trials.

CURRENT LIVE SHOPPER TELEMETRY (Last 10 minutes):
Total Active Shoppers: ${users.length}
Shoppers with High Drop-off Risk: ${highRiskUsers.length} (${highRiskUsers.map(u => `${u.name} (Risk: ${u.dropoffRisk}, Stage: ${u.funnelDropoffStage}, Cart: ₹${u.cartTotalInr}, Hesitation: "${u.lastHesitationReason}")`).join('; ')})

DROP-OFF / HESITATION SIGNALS:
${dropoffActivities.map(d => `- [${d.activityType}] ${d.userName} on screen "${d.screen}": "${d.hesitationReason || d.title}" (Dwell: ${d.dwellSeconds || 0}s, Risk Score: ${d.aiRiskScore || 50}/100)`).join('\n')}

RECENT ACTIVITIES:
${activities.slice(0, 15).map(a => `- ${a.userName} [${a.activityType}]: ${a.title}`).join('\n')}

TASK:
Analyze why shoppers are backing off, identify friction points (e.g. payment UPI hesitation, size out-of-stock, doorstep 6-minute trial anxiety, wholesale markup curiosity), and suggest immediate tactical interventions to recover revenue.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "executiveSummary": "A concise, executive 2-3 sentence summary of current shopping dynamics and primary drop-off bottlenecks in Ahmedabad right now.",
  "dropoffRootCauses": [
    {
      "user": "Customer name",
      "stage": "Funnel stage (e.g. Payment Gateway (UPI), Product Detail, Doorstep Terms, Cart)",
      "trigger": "Specific friction trigger and behavioral signal why they backed off",
      "riskLevel": "Critical" | "High" | "Medium" | "Low"
    }
  ],
  "recommendedActions": [
    {
      "target": "Specific customer or operations team",
      "action": "Immediate tactical intervention (e.g. WhatsApp discount nudge, shelf restock, reassure fitting trial terms)",
      "impact": "Expected revenue or retention impact"
    }
  ],
  "shopperIntentBreakdown": {
    "highIntentCount": number,
    "atRiskDropoffCount": number,
    "windowShoppersCount": number,
    "highIntentPct": number,
    "atRiskPct": number
  }
}`;

        const cleanJsonString = (rawText: string) => {
          let text = rawText.trim();
          if (text.startsWith('```json')) {
            text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (text.startsWith('```')) {
            text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          const firstBrace = text.indexOf('{');
          const lastBrace = text.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
          }
          return text;
        };

        if (isNvidia) {
          // NVIDIA Integrate NIM (meta/muse-glimmer-30b) endpoint
          const nvidiaUrl = `${(process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '')}/chat/completions`;
          const response = await fetch(nvidiaUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: process.env.NVIDIA_MODEL || 'meta/muse-glimmer-30b',
              messages: [
                { role: 'system', content: 'You are Drobe E-Commerce Intelligence Engine. Output valid JSON only, without any commentary.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.3,
              top_p: 0.95,
              max_tokens: 4096,
              stream: false
            })
          });

          if (response.ok) {
            const data = await response.json();
            const choice = data?.choices?.[0]?.message;
            const textContent = choice?.content || choice?.reasoning_content;
            if (textContent) {
              const cleaned = cleanJsonString(textContent);
              const parsed = JSON.parse(cleaned);
              const report: DrobeAIShopperReport = {
                id: `rep-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                executiveSummary: parsed.executiveSummary || 'Live intelligence analysis complete via NVIDIA NIM.',
                dropoffRootCauses: parsed.dropoffRootCauses || [],
                recommendedActions: parsed.recommendedActions || [],
                shopperIntentBreakdown: parsed.shopperIntentBreakdown || {
                  highIntentCount: Math.max(1, users.length - highRiskUsers.length),
                  atRiskDropoffCount: highRiskUsers.length,
                  windowShoppersCount: Math.max(0, users.length - highRiskUsers.length - 1),
                  highIntentPct: Math.round(((users.length - highRiskUsers.length) / (users.length || 1)) * 100),
                  atRiskPct: Math.round((highRiskUsers.length / (users.length || 1)) * 100)
                },
                liveTrafficCount: users.length,
                activeDoorstepTrials: users.filter(u => u.currentStatus === 'In Doorstep Trial').length,
                modelUsed: `NVIDIA NIM ${data?.model || 'meta/muse-glimmer-30b'} (Live AI Pipeline)`
              };
              return NextResponse.json({ success: true, report });
            }
          } else {
            const errBody = await response.text();
            console.warn('NVIDIA API call failed, falling back:', response.status, errBody);
          }
        } else if (isGemini) {
          // Google Gemini 1.5 Flash endpoint
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              const cleaned = cleanJsonString(textContent);
              const parsed = JSON.parse(cleaned);
              const report: DrobeAIShopperReport = {
                id: `rep-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                executiveSummary: parsed.executiveSummary || 'Live intelligence analysis complete.',
                dropoffRootCauses: parsed.dropoffRootCauses || [],
                recommendedActions: parsed.recommendedActions || [],
                shopperIntentBreakdown: parsed.shopperIntentBreakdown || {
                  highIntentCount: Math.max(1, users.length - highRiskUsers.length),
                  atRiskDropoffCount: highRiskUsers.length,
                  windowShoppersCount: Math.max(0, users.length - highRiskUsers.length - 1),
                  highIntentPct: Math.round(((users.length - highRiskUsers.length) / (users.length || 1)) * 100),
                  atRiskPct: Math.round((highRiskUsers.length / (users.length || 1)) * 100)
                },
                liveTrafficCount: users.length,
                activeDoorstepTrials: users.filter(u => u.currentStatus === 'In Doorstep Trial').length,
                modelUsed: 'Google Gemini 1.5 Flash (Live AI Pipeline)'
              };
              return NextResponse.json({ success: true, report });
            }
          } else {
            const errBody = await response.text();
            console.warn('Gemini API call failed, falling back to heuristic engine:', response.status, errBody);
          }
        } else if (isOpenAi) {
          // OpenAI endpoint
          const openAiUrl = 'https://api.openai.com/v1/chat/completions';
          const response = await fetch(openAiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are Drobe E-Commerce Intelligence Engine. Output JSON only.' },
                { role: 'user', content: prompt }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3
            })
          });

          if (response.ok) {
            const data = await response.json();
            const textContent = data?.choices?.[0]?.message?.content;
            if (textContent) {
              const cleaned = cleanJsonString(textContent);
              const parsed = JSON.parse(cleaned);
              const report: DrobeAIShopperReport = {
                id: `rep-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                executiveSummary: parsed.executiveSummary || 'Live intelligence analysis complete.',
                dropoffRootCauses: parsed.dropoffRootCauses || [],
                recommendedActions: parsed.recommendedActions || [],
                shopperIntentBreakdown: parsed.shopperIntentBreakdown || {
                  highIntentCount: Math.max(1, users.length - highRiskUsers.length),
                  atRiskDropoffCount: highRiskUsers.length,
                  windowShoppersCount: Math.max(0, users.length - highRiskUsers.length - 1),
                  highIntentPct: Math.round(((users.length - highRiskUsers.length) / (users.length || 1)) * 100),
                  atRiskPct: Math.round((highRiskUsers.length / (users.length || 1)) * 100)
                },
                liveTrafficCount: users.length,
                activeDoorstepTrials: users.filter(u => u.currentStatus === 'In Doorstep Trial').length,
                modelUsed: 'OpenAI GPT-4o-mini (Live AI Pipeline)'
              };
              return NextResponse.json({ success: true, report });
            }
          }
        }
      } catch (llmErr) {
        console.warn('LLM call error, using heuristic fallback:', llmErr);
      }
    }

    // Adaptive Heuristic AI Fallback if no API key or call failed
    const fallbackReport = generateHeuristicAIShopperReport(activities, users);
    return NextResponse.json({ success: true, report: fallbackReport, isFallback: !apiKey });
  } catch (error: any) {
    console.error('ai-summary API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
