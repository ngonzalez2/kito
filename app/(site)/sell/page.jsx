'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SellForm from '@/components/listings/SellForm';

export default function SellPage() {
  const memoizedForm = useMemo(() => <SellForm />, []);
  const [form] = useState(memoizedForm);

  useEffect(() => {}, []);

  return <React.Fragment>{form}</React.Fragment>;
}
