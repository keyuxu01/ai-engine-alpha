import '@/styles/globals.css';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import { useApp, useHostStyles } from '@modelcontextprotocol/ext-apps/react';
import FlightList from './flight/FlightList';
import type { FlightData } from '@/types';

function App() {
  const { app, isConnected, error } = useApp({
    appInfo: { name: 'FlightList', version: '1.0.0' },
    capabilities: {},
  });

  const [flights, setFlights] = useState<FlightData[]>([]);

  useHostStyles(app, app?.getHostContext());

  useEffect(() => {
    if (!app) return;

    // Handle tool result - this is the proper way to receive MCP data
    app.ontoolresult = (result: any) => {
      const data = result.structuredContent || result;

      if (data.flight?.flights) {
        setFlights(data.flight.flights);
      }
    };

    // Auto-connect if not connected
    if (!isConnected) {
      app.connect().catch(console.error);
    }
  }, [app, isConnected]);

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  if (!isConnected) {
    return <div className="p-4 text-gray-500">Connecting...</div>;
  }

  return <FlightList initialData={{ flights }} />;
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
