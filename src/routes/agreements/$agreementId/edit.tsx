import { createFileRoute, useRouteContext} from '@tanstack/react-router'

export const Route = createFileRoute('/agreements/$agreementId/edit')({
  component: AgreementEdit,
})

function AgreementEdit() {
  const { launchParams } = useRouteContext({ from: '__root__' })
  const user = launchParams?.tgWebAppData?.user

  return (
    <main className="page-wrap px-4 py-12">
     
    </main>
  )
}
