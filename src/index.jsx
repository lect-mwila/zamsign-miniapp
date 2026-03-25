import React from 'react'
import { createRoot } from 'react-dom/client'

// --- Render App ---
const container = document.getElementById('root')
const root = createRoot(container)

root.render(
<div className="w-full h-64 bg-black">
	<h1>Hello React</h1>
</div>
)

