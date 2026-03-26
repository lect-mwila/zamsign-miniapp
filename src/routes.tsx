import type { ComponentType, JSX } from 'react';

import IndexPage from '@/routes/IndexPage';
import AgreementCreatePage from '@/routes/agreements/AgreementCreatePage';
// import { LaunchParamsPage } from '@/routes/LaunchParamsPage.tsx';
// import { ThemeParamsPage } from '@/routes/ThemeParamsPage.tsx';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: IndexPage },
  { path: '/agreements/create', Component: AgreementCreatePage },
  // { path: '/agreements/:agreementId/', Component: AgreementCreatePage },
  // { path: '/init-data', Component: InitDataPage, title: 'Init Data' },

];