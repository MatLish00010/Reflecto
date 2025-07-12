import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const prompt = formData.get('prompt') as string

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Convert File to Buffer for OpenAI API
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a file-like object for OpenAI
    const file = new File([buffer], audioFile.name, { type: audioFile.type })

    try {
      // Use OpenAI transcription API with prompt
      const transcription = await openai.audio.transcriptions.create({
        model: process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-transcribe",
        file: file,
        response_format: "text",
        prompt: prompt || undefined, // Only include prompt if provided
      })

      return NextResponse.json({ 
        text: transcription,
        confidence: 1.0,
        promptUsed: !!prompt
      })
      
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError)
      
      // Handle specific OpenAI errors
      if (openaiError.status === 401) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key' },
          { status: 401 }
        )
      } else if (openaiError.status === 413) {
        return NextResponse.json(
          { error: 'File too large (maximum 25MB)' },
          { status: 413 }
        )
      } else if (openaiError.status === 400) {
        return NextResponse.json(
          { error: 'Unsupported audio file format or invalid prompt' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Error processing audio through OpenAI' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error processing audio:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 