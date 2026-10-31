'use client';

import { useMemo } from 'react';
import { useResume } from '@/store/resume-context';
import { ResumeDocument, ResumeSection, SectionItem } from '@/lib/models/types';
import { sanitizeResumeDocument, sanitizeUrl } from '@/lib/utils/sanitize';
import PreviewPhoto from '@/components/preview/PreviewPhoto';
import { PrintWatermark, ResumeWatermark } from '@/components/preview/ResumeWatermark';

interface Props {
  id?: string;
  document?: ResumeDocument;
  showWatermark?: boolean;
}

function formatDateRange(start?: string, end?: string, current?: boolean): string {
  if (current) {
    return [start, 'Sekarang'].filter(Boolean).join(' - ');
  }
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
}

function displayUrl(value: string): string {
  return value.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

function contactHref(value: string, type: 'email' | 'phone'): string {
  const raw = value.trim();
  if (!raw) return '';
  if (type === 'email') {
    return sanitizeUrl(/^mailto:/i.test(raw) ? raw : `mailto:${raw}`);
  }
  const number = raw.replace(/[^\d+]/g, '');
  return number ? sanitizeUrl(`tel:${number}`) : '';
}

export default function ResumePreview({ id = 'resume-preview', document, showWatermark = true }: Props) {
  const { state } = useResume();
  const source = document ?? state.document;
  const doc = useMemo(() => sanitizeResumeDocument(source), [source]);
  const isMinimal = doc.settings?.template === 'minimal';
  const showPhoto = !isMinimal ? false : doc.personalInfo.showPhoto;

  const contacts = [
    { label: doc.personalInfo.email, href: contactHref(doc.personalInfo.email, 'email') },
    { label: doc.personalInfo.phone, href: contactHref(doc.personalInfo.phone, 'phone') },
    { label: doc.personalInfo.location, href: '' },
    { label: doc.personalInfo.linkedin ? displayUrl(doc.personalInfo.linkedin) : '', href: doc.personalInfo.linkedin },
    { label: doc.personalInfo.github ? displayUrl(doc.personalInfo.github) : '', href: doc.personalInfo.github },
    { label: doc.personalInfo.website ? displayUrl(doc.personalInfo.website) : '', href: doc.personalInfo.website },
  ].filter((contact) => contact.label.trim().length > 0);

  const sectionTitleClass = isMinimal
    ? 'text-xs font-semibold uppercase tracking-[0.18em] border-b border-black pb-1 mb-2'
    : 'text-lg font-semibold border-b border-black pb-1 mb-2';

  const itemTitleClass = 'font-semibold';

  const renderItemDescription = (content?: { html: string }) => (
    content?.html ? (
      <div className='prose prose-sm max-w-none text-black' dangerouslySetInnerHTML={{ __html: content.html }} />
    ) : null
  );

  const renderSection = (section: ResumeSection) => {
    const items = section.items || [];

    return (
      <div key={section.id} className='text-black'>
        <h2 className={sectionTitleClass}>{section.title}</h2>

        {section.type === 'experience' && items.map((item: SectionItem) => {
          const dateRange = formatDateRange(item.startDate, item.endDate, item.current);
          return (
            <div key={item.id} className='resume-item mb-3'>
              <div className='flex justify-between gap-4'>
                <div>
                  <p className={itemTitleClass}>{item.position || ''}</p>
                  <p className='text-sm text-black'>
                    {[item.company, item.location].filter(Boolean).join(' | ')}
                  </p>
                </div>
                {dateRange && <p className='text-sm text-black whitespace-nowrap'>{dateRange}</p>}
              </div>
              {renderItemDescription(item.description)}
            </div>
          );
        })}

        {section.type === 'education' && items.map((item: SectionItem) => {
          const dateRange = formatDateRange(item.startDate, item.endDate, item.current);
          const details = [item.degree, item.grade ? `IPK/Nilai: ${item.grade}` : '', item.location]
            .filter(Boolean)
            .join(' | ');
          return (
            <div key={item.id} className='resume-item mb-3'>
              <div className='flex justify-between gap-4'>
                <div>
                  <p className={itemTitleClass}>{item.school || ''}</p>
                  {details && <p className='text-sm text-black'>{details}</p>}
                </div>
                {dateRange && <p className='text-sm text-black whitespace-nowrap'>{dateRange}</p>}
              </div>
              {renderItemDescription(item.notes || item.description)}
            </div>
          );
        })}

        {section.type === 'projects' && items.map((item: SectionItem) => (
          <div key={item.id} className='resume-item mb-3'>
            <div className='flex justify-between gap-4'>
              <p className={itemTitleClass}>
                {item.name || ''}
                {item.url && (
                  <>
                    {' '}
                    <a href={item.url} className='font-normal underline underline-offset-2' target='_blank' rel='noopener noreferrer'>
                      {displayUrl(item.url)}
                    </a>
                  </>
                )}
              </p>
              {item.period && <p className='text-sm text-black whitespace-nowrap'>{item.period}</p>}
            </div>
            {renderItemDescription(item.description)}
          </div>
        ))}

        {section.type === 'certifications' && items.map((item: SectionItem) => (
          <div key={item.id} className='resume-item mb-2'>
            <p className={itemTitleClass}>
              {item.name || ''}
              {item.credentialUrl && (
                <>
                  {' '}
                  <a href={item.credentialUrl} className='font-normal underline underline-offset-2' target='_blank' rel='noopener noreferrer'>
                    Kredensial
                  </a>
                </>
              )}
            </p>
            <p className='text-sm text-black'>
              {[item.issuer, item.date].filter(Boolean).join(' | ')}
            </p>
            {renderItemDescription(item.description)}
          </div>
        ))}

        {section.type === 'languages' && (
          <ul className='list-disc list-inside text-black'>
            {items.map((item: SectionItem) => (
              <li key={item.id}>
                <span className='text-black'>{item.name || ''}</span>
                {item.level ? ` - ${item.level}` : ''}
              </li>
            ))}
          </ul>
        )}

        {section.type === 'skills' && items.map((item: SectionItem) => (
          <div key={item.id} className='mb-2'>
            {renderItemDescription(item.description)}
          </div>
        ))}

        {section.type === 'custom' && items.map((item: SectionItem) => (
          <div key={item.id} className='resume-item mb-3'>
            <p className={itemTitleClass}>{item.name || ''}</p>
            {renderItemDescription(item.description)}
          </div>
        ))}
      </div>
    );
  };

  const visibleSections = doc.sections
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order)
    .filter((section) => (section.items || []).length > 0);

  return (
    <div
      id={id}
      className='bg-white shadow mx-auto text-black relative'
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: doc.settings?.fontFamily || 'Arial, Helvetica, sans-serif',
      }}
    >
      <div className={`relative z-10 p-10 space-y-4 ${isMinimal ? 'resume-template-minimal' : 'resume-template-ats'}`}>
        <div className={isMinimal ? 'border-l-4 border-black pl-4 pb-3' : 'pb-3 border-b border-black'}>
          <div className='flex gap-4 items-start'>
            <PreviewPhoto photoId={doc.personalInfo.photoId} showPhoto={showPhoto} />
            <div className='flex-1 text-black'>
              <h1 className={isMinimal ? 'text-4xl font-bold tracking-tight text-black' : 'text-3xl font-bold text-black'}>
                {doc.personalInfo.fullName || 'Nama Lengkap'}
              </h1>
              <p className={isMinimal ? 'text-base text-black mt-1' : 'text-black'}>
                {doc.personalInfo.headline || 'Headline Profesional'}
              </p>
              {contacts.length > 0 && (
                <div className='text-sm text-black mt-2 flex flex-wrap gap-x-2 gap-y-1'>
                  {contacts.map((contact, index) => (
                    <span key={`${contact.label}-${index}`} className='inline-flex items-center'>
                      {index > 0 && <span className='mr-2 text-black'>{isMinimal ? '•' : '|'}</span>}
                      {contact.href ? (
                        <a href={contact.href} className='text-black underline underline-offset-2' target='_blank' rel='noopener noreferrer'>
                          {contact.label}
                        </a>
                      ) : (
                        contact.label
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {doc.summary.html && (
          <div className='text-black'>
            <h2 className={sectionTitleClass}>Profil</h2>
            <div className='prose prose-sm max-w-none text-black' dangerouslySetInnerHTML={{ __html: doc.summary.html }} />
          </div>
        )}

        {visibleSections.map(renderSection)}
      </div>

      {showWatermark && (
        <>
          <ResumeWatermark />
          <PrintWatermark document={doc} />
        </>
      )}
    </div>
  );
}
