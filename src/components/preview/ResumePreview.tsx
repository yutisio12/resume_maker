'use client';

import { useResume } from '@/store/resume-context';
import { SectionItem } from '@/lib/models/types';
import PreviewPhoto from '@/components/preview/PreviewPhoto';

interface Props {
  id?: string;
}

export default function ResumePreview({ id = 'resume-preview' }: Props) {
  const { state } = useResume();
  const doc = state.document;

  return (
    <div
      id={id}
      className='bg-white shadow mx-auto text-black'
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: doc.settings?.fontFamily || 'Arial, Helvetica, sans-serif',
      }}
    >
      <div className='p-10 space-y-4'>
        <div className='flex gap-4 items-start'>
          <PreviewPhoto />
          <div className='flex-1 text-black'>
            <h1 className='text-3xl font-bold text-black'>{doc.personalInfo.fullName || 'Nama Lengkap'}</h1>
            <p className='text-black'>{doc.personalInfo.headline || 'Headline Profesional'}</p>
            <div className='text-sm text-black mt-1 flex flex-wrap gap-2'>
              {doc.personalInfo.email && <span>{doc.personalInfo.email}</span>}
              {doc.personalInfo.phone && <span>| {doc.personalInfo.phone}</span>}
              {doc.personalInfo.location && <span>| {doc.personalInfo.location}</span>}
            </div>
          </div>
        </div>
        {doc.summary.html && (
          <div className='text-black'>
            <h2 className='text-lg font-semibold border-b mb-2 text-black'>Profil</h2>
            <div className='prose prose-sm max-w-none text-black' dangerouslySetInnerHTML={{ __html: doc.summary.html }} />
          </div>
        )}
        {doc.sections.filter(s => s.visible).sort((a, b) => a.order - b.order).map((s) => (
          <div key={s.id} className='text-black'>
            <h2 className='text-lg font-semibold border-b mb-2 text-black'>{s.title}</h2>
            {s.type === 'experience' && (s.items || []).map((item: SectionItem) => (
              <div key={item.id} className='mb-3'>
                <div className='flex justify-between'>
                  <div>
                    <p className='font-semibold text-black'>{item.position || ''}</p>
                    <p className='text-sm text-black'>{item.company || ''} {item.location ? `| ${item.location}` : ''}</p>
                  </div>
                  <p className='text-sm text-black'>{item.startDate || ''} {(item.endDate || item.current) ? (item.current ? ' - Sekarang' : ` - ${item.endDate}`) : ''}</p>
                </div>
                {item.description?.html && (
                  <div className='prose prose-sm max-w-none text-black' dangerouslySetInnerHTML={{ __html: item.description.html }} />
                )}
              </div>
            ))}
            {s.type === 'education' && (s.items || []).map((item: SectionItem) => (
              <div key={item.id} className='mb-3'>
                <div className='flex justify-between'>
                  <div>
                    <p className='font-semibold text-black'>{item.school || ''}</p>
                    <p className='text-sm text-black'>{item.degree || ''}</p>
                  </div>
                  <p className='text-sm text-black'>{item.startDate || ''} {(item.endDate || item.current) ? (item.current ? ' - Sekarang' : ` - ${item.endDate}`) : ''}</p>
                </div>
                {item.description?.html && (
                  <div className='prose prose-sm max-w-none text-black' dangerouslySetInnerHTML={{ __html: item.description.html }} />
                )}
              </div>
            ))}
            {s.type === 'projects' && (s.items || []).map((item: SectionItem) => (
              <div key={item.id} className='mb-3'>
                <p className='font-semibold text-black'>{item.name || ''} {item.url ? <a href={item.url} className='text-black underline'>{item.url}</a> : ''}</p>
                {item.description?.html && (
                  <div className='prose prose-sm max-w-none text-black' dangerouslySetInnerHTML={{ __html: item.description.html }} />
                )}
              </div>
            ))}
            {s.type === 'certifications' && (s.items || []).map((item: SectionItem) => (
              <div key={item.id} className='mb-2'>
                <p className='font-semibold text-black'>{item.name || ''}</p>
                <p className='text-sm text-black'>{item.issuer || ''} {item.date ? `| ${item.date}` : ''}</p>
              </div>
            ))}
            {s.type === 'languages' && (
              <ul className='list-disc list-inside text-black'>
                {(s.items || []).map((item: SectionItem) => (
                  <li key={item.id}><span className='text-black'>{item.name || ''}</span>{item.level ? ` - ${item.level}` : ''}</li>
                ))}
              </ul>
            )}
            {s.type === 'skills' && (s.items?.[0] as SectionItem)?.description?.html && (
              <div className='prose prose-sm max-w-none text-black' dangerouslySetInnerHTML={{ __html: (s.items?.[0] as SectionItem).description?.html || '' }} />
            )}
            {(s.items || []).length === 0 && !['skills', 'languages'].includes(s.type) && <p className='text-sm text-gray-500 italic'>Belum ada item</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
