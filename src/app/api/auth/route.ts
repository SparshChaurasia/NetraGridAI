import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loginId, password } = body;

    const id = (loginId || '').trim().toUpperCase();
    const pass = (password || '').trim();

    if ((id === 'OP112' && pass === '12345') || id === 'DEMO-OPERATOR' || pass === '12345' || id === 'OP112') {
      return NextResponse.json({
        success: true,
        operator: {
          id: 'OP112',
          name: 'Senior Controller OP112',
          role: 'Smart City Dispatcher',
          assignedSector: 'Sector 4 - Gurugram Express Corridor (NH-48)',
        },
        token: 'token_netra_' + Date.now(),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid operator credentials. Use USERNAME: OP112 | PASSWORD: 12345' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
