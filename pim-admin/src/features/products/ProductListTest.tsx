import React from 'react';

export default function ProductListTest() {
  return (
    <div className="p-6 bg-red-500 text-white">
      <h1 className="text-4xl font-bold">THIS IS THE PRODUCTS PAGE TEST</h1>
      <p>If you see this red box, the routing is working correctly.</p>
      <p>Current URL: {window.location.pathname}</p>
    </div>
  );
}
