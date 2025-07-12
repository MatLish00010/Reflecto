import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Аудио файл не найден' },
        { status: 400 }
      )
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockText = "Это пример распознанного текста. В реальном приложении здесь будет результат работы API распознавания речи."
    
    return NextResponse.json({ 
      text: mockText,
      confidence: 0.95
    })
    
  } catch (error) {
    console.error('Ошибка при обработке аудио:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 