import {
  setDebug,
  themeParams,
  initData,
  viewport,
  init as initSDK,
  mockTelegramEnv,
  type ThemeParams,
  retrieveLaunchParams,
  emitEvent,
  miniApp,
  backButton,
} from '@tma.js/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  // Set @telegram-apps/sdk-react debug mode.
  setDebug(options.debug);

  // Initialize SDK. We wrap this in a try/catch because in HMR/Dev mode, 
  // it might already be initialized.
  try {
    initSDK();
  } catch (e) {
    console.warn('SDK already initialized');
  }

  // Add Eruda if needed.
  if (options.eruda) {
    void import('eruda').then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 0 });
    });
  }

  // Telegram for macOS fixes/mocks
  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event.name === 'web_app_request_theme') {
          let tp: ThemeParams = {};
          if (firstThemeSent) {
            tp = themeParams.state();
          } else {
            firstThemeSent = true;
            tp ||= retrieveLaunchParams().tgWebAppThemeParams;
          }
          return emitEvent('theme_changed', { theme_params: tp });
        }

        if (event.name === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
        }

        next();
      },
    });
  }

  // Mount components only if they aren't already mounted.
  if (backButton.mount.isAvailable() && !backButton.isMounted()) {
    backButton.mount();
  }

  initData.restore();

  if (miniApp.mount.isAvailable()) {
    if (!themeParams.isMounted()) themeParams.mount();
    if (!miniApp.isMounted()) miniApp.mount();
    
    // Check if CSS vars are already bound to prevent CSSVarsBoundError
    if (!themeParams.isCssVarsBound()) {
      themeParams.bindCssVars();
    }
  }

  if (viewport.mount.isAvailable()) {
    // If not mounted, mount it. If already mounting/mounted, this returns the existing promise.
    if (!viewport.isMounted()) {
      await viewport.mount();
    }
    
    // Check if CSS vars are already bound for the viewport
    if (!viewport.isCssVarsBound()) {
      viewport.bindCssVars();
    }
  }
}