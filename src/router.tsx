import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import type { LaunchParams } from '@tma.js/sdk-react'

// Define the shape of your context
export interface TelegramContext {
  launchParams?: LaunchParams
}
export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
	context: {
      launchParams: undefined,
    } as TelegramContext,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,

  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
