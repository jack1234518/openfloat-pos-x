'use client';

import { useEffect, useState } from 'react';

interface ClientDateProps {
  date: Date | string;
  format?: 'full' | 'short' | 'time';
}

export default function ClientDate({ date, format = 'full' }: ClientDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'time') {
      setFormattedDate(d.toLocaleTimeString());
    } else if (format === 'short') {
      setFormattedDate(d.toLocaleDateString());
    } else {
      setFormattedDate(d.toLocaleString());
    }
  }, [date, format]);

  return <span>{formattedDate}</span>;
}