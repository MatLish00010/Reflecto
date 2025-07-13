import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    name?: string;
  };
}

export async function authenticateUser(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: { id: number; name?: string };
  error?: string;
}> {
  try {
    // Получаем userId из cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const userIdMatch = cookieHeader.match(/userId=([^;]+)/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    if (!userId) {
      return {
        isAuthenticated: false,
        error: 'User not authenticated',
      };
    }

    // Проверяем существование пользователя в базе данных
    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', parseInt(userId))
      .single();

    if (error || !user) {
      return {
        isAuthenticated: false,
        error: 'User not found',
      };
    }

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.name || undefined,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication failed',
    };
  }
}

export async function requireAuth(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: { id: number; name?: string };
  response?: NextResponse;
}> {
  const authResult = await authenticateUser(request);

  if (!authResult.isAuthenticated) {
    return {
      isAuthenticated: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    isAuthenticated: true,
    user: authResult.user,
  };
}
