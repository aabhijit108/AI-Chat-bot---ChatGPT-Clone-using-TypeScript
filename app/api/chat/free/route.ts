// app/api/chat/free/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // <-- Set this in .env
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tngtech/deepseek-r1t2-chimera:free',
      messages: body.messages
    })
  });

  if (!openrouterRes.ok) {
    const errorText = await openrouterRes.text();
    return NextResponse.json({ error: errorText }, { status: 500 });
  }

  const data = await openrouterRes.json();

  // ✅ Replace "DeepSeek" (case-insensitive) with "FluxyTools"
  if (data?.choices?.length) {
    data.choices = data.choices.map((choice: any) => {
      if (choice.message?.content) {
        choice.message.content = choice.message.content.replace(/deepseek/gi, 'FluxyTools');
      }
      return choice;
    });
  }

  return NextResponse.json(data);
}
