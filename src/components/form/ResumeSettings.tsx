'use client';

import { useResume } from '@/store/resume-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RESUME_FONTS, DEFAULT_FONT_FAMILY } from '@/lib/constants/fonts';

export default function ResumeSettings() {
  const { state, dispatch } = useResume();
  const settings = state.document.settings || { template: 'ats-classic', showPhoto: false, fontFamily: DEFAULT_FONT_FAMILY };

  return (
    <Card>
      <CardHeader><CardTitle>Pengaturan CV</CardTitle></CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <Label>Template</Label>
            <select
              className='h-9 w-full rounded-md border border-input bg-card px-2 py-1 text-sm text-foreground'
              aria-label='Template'
              value={settings.template}
              onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { template: e.target.value === 'minimal' ? 'minimal' : 'ats-classic' } })}
            >
              <option value='ats-classic'>ATS Classic</option>
              <option value='minimal'>Minimal</option>
            </select>
          </div>
          <div>
            <Label>Font</Label>
            <select
              className='h-9 w-full rounded-md border border-input bg-card px-2 py-1 text-sm text-foreground'
              aria-label='Font'
              value={settings.fontFamily || DEFAULT_FONT_FAMILY}
              onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { fontFamily: e.target.value } })}
            >
              {RESUME_FONTS.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
        </div>
        <p className='text-xs text-muted-foreground'>ATS Classic menyembunyikan foto dan memakai tata letak satu kolom. Minimal menampilkan foto jika diaktifkan.</p>
      </CardContent>
    </Card>
  );
}
