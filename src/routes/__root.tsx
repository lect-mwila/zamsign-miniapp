import { createRootRouteWithContext } from '@tanstack/react-router'
import { retrieveLaunchParams } from '@tma.js/sdk-react'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import type { TelegramContext } from '@/router' // Import the interface
import '../style.css'
import { init as initTMA } from '@/init.ts'

// Global TMA INIT Variable
// We need this to prevent the telegram sdk from initializing
// everytime the router gets refreshed

let isTmaInitialized = false;

export const Route = createRootRouteWithContext<TelegramContext>()({
	beforeLoad: async () => {
    if (typeof window === 'undefined') return { launchParams: undefined };

	
	if (isTmaInitialized) {
      try {
        return { launchParams: retrieveLaunchParams() };
      } catch {
        return { launchParams: undefined };
      }
    }
    try {
    if (import.meta.env.DEV) {
      await import('../mockEnv.ts');
    }
		
      const lp = retrieveLaunchParams();
      
      // Initialize TMA logic
      await initTMA({
        debug: import.meta.env.DEV,
        eruda: false,
        mockForMacOS: lp.tgWebAppPlatform === 'macos',
      });
	  
	  isTmaInitialized = true;
      return { launchParams: lp };
    } catch (e: any) {
      // If it's just a CSS binding error, we can actually ignore it 
      // and proceed because the app is otherwise functional.
      if (e?.name === 'CSSVarsBoundError') {
        return { launchParams: retrieveLaunchParams() };
      }

      console.error("TMA Init failed", e);
      throw e; // Let errorComponent handle real failures
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Invoice AI',
      },
    ]
  }),
  shellComponent: RootComponent,
  errorComponent: ({ error }) => {
    return <p>Environment Unsupported{JSON.stringify(error)}</p>
    },
  notFoundComponent: () => {
  	return <p>Page not found</p>
	},
})

function RootComponent({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument>
    	<div className="min-h-screen"> 
            {children}
        </div>
        {/*<Footer />*/}
		{/*<BottomBar />*/}
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
	<>
        {children}
		  <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
		</>
  )
}

