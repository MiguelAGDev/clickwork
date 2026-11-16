// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      A job posting as a row of a list (design: navy square with a gold
//      briefcase, title, one line of details, gold "Nuevo" badge). The
//      whole row opens the posting.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { Bookmark, Briefcase } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/Badge.tsx"
import { getJobSummary, isNew } from "@/lib/jobs.ts"
import { cn } from "@/lib/utils.ts"
import type { JobPosting } from "@/types/models.ts"

interface JobCardProps {
    job: JobPosting
    // Where the row leads.
    to: string
    // Overrides the default details line.
    summary?: string
    // Shown on the right, before the save button (a status badge, a date...).
    trailing?: ReactNode
    // When both are given, the row shows a "save" toggle.
    saved?: boolean
    onToggleSaved?: () => void
}

function JobCard( { job, to, summary, trailing, saved, onToggleSaved }: JobCardProps ) {
    return (
        // "relative" + the stretched link below make the whole row
        // clickable while keeping a single real <a> with the job title
        // as its name, which is what a screen reader should announce.
        <article className="relative flex items-center gap-4 rounded-xl border border-border bg-card px-[18px] py-3.5 transition-colors hover:border-primary">
            <div aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-panel">
                <Briefcase className="size-[18px] text-primary" strokeWidth={ 1.8 } />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                {/* On a phone a long title wraps to two lines instead of
                    being cut; from sm up there is room for one line. */}
                <h3 className="line-clamp-2 text-[14.5px] font-bold text-foreground sm:line-clamp-1">
                    <Link to={ to } className="after:absolute after:inset-0 after:rounded-xl">
                        { job.title }
                    </Link>
                </h3>
                <p className="truncate text-[12.5px] text-muted-foreground">{ summary ?? getJobSummary( job ) }</p>
            </div>

            { isNew( job ) && <Badge tone="gold">Nuevo</Badge> }
            { trailing }

            { onToggleSaved && (
                <button
                    type="button"
                    // z-10: sits above the stretched link, so clicking it
                    // saves the job instead of opening it.
                    className="relative z-10 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                    aria-pressed={ saved }
                    aria-label={ saved ? `Quitar ${ job.title } de guardadas` : `Guardar ${ job.title }` }
                    onClick={ onToggleSaved }
                >
                    <Bookmark aria-hidden className={ cn( "size-[18px]", saved && "fill-primary text-primary" ) } strokeWidth={ 1.8 } />
                </button>
            ) }
        </article>
    )
}

export { JobCard }
