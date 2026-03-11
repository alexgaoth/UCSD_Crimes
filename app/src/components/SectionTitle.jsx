import React from 'react';

export default function SectionTitle({ children, accent }) {
  return (
    <h2 className="section-title">
      <span className="section-title-block" style={accent ? { background: accent } : {}}></span>
      {children}
    </h2>
  );
}
