import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { retrieveLaunchParams } from '@tma.js/sdk-react'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'
import BottomBar from '../components/BottomBar'
import type { TelegramContext } from '../router' // Import the interface
import appCss from '../styles.css?url'
import { init as initTMA } from '../init.ts'
import { JazzReactProvider } from 'jazz-tools/react'
import { MyAppAccount } from '../schema.ts'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'light';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

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
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
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
        <Header />
        <JazzWrapper>
    		  <div className="min-h-screen"> 
            {children}
          </div>
        </JazzWrapper>
        {/*<Footer />*/}
		{/*<BottomBar />*/}
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased h-full selection:bg-[rgba(79,184,178,0.24)]">
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
        <Scripts />
      </body>
    </html>
  )
}


export function JazzWrapper({ children }: { children: React.ReactNode }) {
  return (
    <JazzReactProvider
          sync={{peer: `wss://cloud.jazz.tools/?key=${import.meta.env.JAZZ_API_KEY}`}}
          AccountSchema={MyAppAccount}
        >
      {children}
    </JazzReactProvider>
  );
}