import { createFileRoute, useRouteContext} from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  const { launchParams } = useRouteContext({ from: '__root__' })
  const user = launchParams?.tgWebAppData?.user

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-lg p-6 sm:p-8 mb-8">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          What is Invoice AI?
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Invoice AI allows people to create invoices in minutes using their mobile phones.
        </p>
      </section>
      <article className="island-shell rounded-lg p-5 w-48 text-center mx-auto">
        <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
          <span className="h-2 w-2 rounded-sm bg-[linear-gradient(90deg,#56bec6,#7ebfd3)]" />
          Telegram Status
        </h2>
        {user && <img src={user.photo_url} className="h-24 w-24 rounded-full mx-auto" />}
        {user && <p className="m-0 text-sm text-[var(--sea-ink-soft)]">Name:{" "}{user.first_name},{user.last_name}</p>}
        {user && <p className="m-0 text-sm text-[var(--sea-ink-soft)]">ID:{" "}{user.id}</p>}
      </article>
    </main>
  )
}
