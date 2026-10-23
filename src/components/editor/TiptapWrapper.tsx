'use client';

import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });

interface Props {
  content: string;
  onChange: (html: string, text: string) => void;
}

export default function TiptapWrapper(props: Props) {
  return <TiptapEditor {...props} />;
}
