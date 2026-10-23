'use client';

import { useResume } from '@/store/resume-context';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useState } from 'react';

export default function ExportPdfButton() {
  const { state } = useResume();
  const [loading, setLoading] = useState(false);

  const exportPdf = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      const name = state.document.personalInfo.fullName || 'Resume';
      pdf.save(Resume-.pdf);
    } catch (e) {
      alert('Gagal export PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size='sm' onClick={exportPdf} disabled={loading}>
      <FileDown className='w-4 h-4 mr-1' />{loading ? 'Membuat PDF...' : 'Export PDF'}
    </Button>
  );
}
