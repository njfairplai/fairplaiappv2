'use client'

import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

/**
 * "Nothing here" placeholder. Defaults to an inbox icon at 40% opacity.
 * Title + description follow the active palette via brand tokens.
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 opacity-40 text-brand-indigo-mute">
        {icon ?? <Inbox size={48} />}
      </div>
      <h3 className="m-0 mb-2 font-satoshi text-lg font-bold text-brand-indigo">{title}</h3>
      {description && (
        <p className="m-0 mb-4 max-w-[280px] font-satoshi text-sm text-brand-indigo-mute">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
