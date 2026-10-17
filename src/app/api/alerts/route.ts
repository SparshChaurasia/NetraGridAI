import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const newId = `INC-00${Math.floor(43 + Math.random() * 50)}`;

    const alertPayload = {
      id: newId,
      cameraId: 'CAM-07',
      cameraName: 'NH-48 Km 112 - Two-Wheeler Fall & Rollover',
      location: body.location || 'Gurugram NH-48 Express Corridor',
      severity: 'CRITICAL',
      confidence: 0.94,
      status: 'AWAITING',
      remainingSeconds: 15,
      detectedAt: new Date().toISOString(),
      impactSpeed: '58 km/h sudden velocity drop',
      vehicleType: 'Two-Wheeler Fall & Rollover',
      sector: 'Sector 4 - Gurugram Express Corridor (NH-48)',
    };

    return NextResponse.json({ success: true, alert: alertPayload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
