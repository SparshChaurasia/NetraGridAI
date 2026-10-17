import { NextResponse } from 'next/server';
import { INITIAL_INCIDENTS } from '../../../lib/mockData';

export async function GET() {
  return NextResponse.json({ success: true, incidents: INITIAL_INCIDENTS });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body; // action: 'dismiss' | 'acknowledge' | 'dispatch'

    return NextResponse.json({
      success: true,
      incidentId: id,
      updatedStatus: action === 'dismiss' ? 'DISMISSED' : action === 'acknowledge' ? 'ACKNOWLEDGED' : 'DISPATCHED',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
