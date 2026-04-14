import { NextResponse } from 'next/server';
import { analyzeText } from '@/lib/services/anthropic';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, text, type = 'auto', apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    let contentToAnalyze = '';

    if (url) {
      // Fetch and extract text from URL
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove script/style tags
      $('script, style, nav, footer, header').remove();
      
      // Extract main content
      contentToAnalyze = $('article').text() || 
                        $('main').text() || 
                        $('.content').text() || 
                        $('body').text();
      
      // Clean up
      contentToAnalyze = contentToAnalyze
        .replace(/\s+/g, ' ')
        .substring(0, 15000); // Limit length
    } else if (text) {
      contentToAnalyze = text;
    } else {
      return NextResponse.json(
        { error: 'Must provide url or text' },
        { status: 400 }
      );
    }

    // Analyze with Anthropic
    const analysis = await analyzeText(contentToAnalyze, apiKey);

    return NextResponse.json({
      success: true,
      source: url || 'direct-text',
      analysis,
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error?.message },
      { status: 500 }
    );
  }
}
