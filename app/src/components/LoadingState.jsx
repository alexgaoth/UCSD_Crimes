import React from 'react';

export default function LoadingState({ message = 'Loading...' }) {
  return <div className="loading">{message}</div>;
}