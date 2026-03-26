import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'


export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-xs px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,164,188,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,70,104,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Invoice AI</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Invoice baby!
        </h1>
		lsp
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          We make invoices simple, accessible, and trusted for everyone.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://t.me/invoiceaibot"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-[rgba(50,143,151,0.3)] bg-[rgba(79,114,178,0.14)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,114,178,0.24)]"
          >
            Get Started on Telegram 
          </a>
		  <Link
            to="/about"
			suppressHydrationWarning
            className="rounded-sm border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--blue-grey)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            About ZamSign
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            'Manage Multiple Signees',
            'Signees, Witnesses to ensure trusted parties are not left behind.',
          ],
          [
            'Digital Signature',
            'Prove your agreements with your digital signature.',
          ],
          [
            'QR Code Authentication',
            'Each agreement will include a QR code that allows verification of authenticity.',
          ]
        ].map(([title, desc], index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-lg p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{desc}</p>
          </article>
        ))}
      </section>

      <section className="island-shell mt-8 rounded-lg p-6">
        <p className="island-kicker mb-2">Simple Guide [Delete if needed]</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
          <li>
            Edit <code>src/routes/index.tsx</code> to customize the home page.
          </li>
          <li>
            Update <code>src/components/Header.tsx</code> and{' '}
            <code>src/components/Footer.tsx</code> for brand links.
          </li>
          <li>
            Add routes in <code>src/routes</code> and tweak visual tokens in{' '}
            <code>src/styles.css</code>.
          </li>
        </ul>
      </section>
    </main>
  )
}
