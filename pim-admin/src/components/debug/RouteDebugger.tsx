import React from 'react';

export default function RouteDebugger() {
  return (
    <div className="fixed top-20 right-4 z-50 bg-red-600 text-white p-4 rounded-lg shadow-xl">
      <h3 className="font-bold text-lg">ROUTE DEBUGGER</h3>
      <p>Current Path: {window.location.pathname}</p>
      <p>Component: RouteDebugger</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
