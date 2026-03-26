import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useAccount, useCoState } from "jazz-tools/react";
import { MyAppAccount, DesignDoc } from '../schema';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { launchParams } = useRouteContext({ from: '__root__' })
  const invoiceId = launchParams?.tgWebAppStartParam || 'co_z9nJQ6bJUN3tV8DvHuQZiyHJdAN';
  const invoice = useCoState(DesignDoc, invoiceId);

  if (!invoice?.$isLoaded) {
    return <div className="p-2 text-white text-center">Loading invoice {invoiceId}...</div>;
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <TransformWrapper
        initialScale={0.3}              // ← start at 100%, no forced zoom-out
        initialPositionX={0}
        initialPositionY={0}
        centerOnInit={true}           // ← tries to center (works better in newer versions)
        minScale={0.3}
        maxScale={3}
        limitToBounds={false}         // allow panning beyond edges if wanted
        wheel={{ step: 0.1 }}
        pinch={{ disabled: false }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100vh',           // ← or 90vh / fixed px — acts as your "canvas frame"
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',       // clip content outside frame
            background: 'white',
          }}
          contentStyle={{
            width: '924px',           // ← match your invoice's natural width
            minWidth: '924px',
            // height: '1192px',      // optional: force A4-like height if content doesn't fill
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: invoice.html || '<p>No HTML yet</p>' }}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}