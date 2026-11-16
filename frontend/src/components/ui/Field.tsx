// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Form fields: a label, a control (input, select or textarea), an
//      optional hint and the error message, wired together for screen
//      readers. Built to receive the props of react-hook-form register().
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

import { useId } from "react"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils.ts"

// Shared look of the three controls (46px tall, 2px border, as in the
// login design). aria-invalid paints the border red.
const controlClasses =
    "w-full rounded-[10px] border-2 border-input bg-card px-3.5 text-sm text-foreground " +
    "placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground " +
    "aria-invalid:border-danger"

interface FieldFrameProps {
    id: string
    label: string
    error?: string
    hint?: string
    optional?: boolean
    // Extra content on the label row, to the right (the login uses it for
    // the "forgot it?" link).
    labelAction?: ReactNode
    className?: string
    children: ReactNode
}

// Label + control + messages. The control itself comes as children.
function FieldFrame( { id, label, error, hint, optional, labelAction, className, children }: FieldFrameProps ) {
    return (
        <div className={ cn( "flex flex-col gap-1.5", className ) }>
            <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={ id } className="text-[13px] font-semibold text-foreground">
                    { label }
                    { optional && <span className="ml-1 font-normal text-muted-foreground">(opcional)</span> }
                </label>
                { labelAction }
            </div>

            { children }

            { hint && !error && (
                <p id={ `${ id }-hint` } className="text-[12.5px] text-muted-foreground">{ hint }</p>
            ) }
            { error && (
                // role="alert": a screen reader announces the error as soon
                // as it appears, without the user having to find it.
                <p id={ `${ id }-error` } role="alert" className="text-[12.5px] font-medium text-danger">{ error }</p>
            ) }
        </div>
    )
}

// Props every field shares, on top of the ones of its HTML control.
interface FieldExtras {
    label: string
    error?: string
    hint?: string
    optional?: boolean
    labelAction?: ReactNode
    // Classes for the wrapper (for example a grid column span).
    wrapperClassName?: string
}

// Tells assistive tech which text describes the control.
function describedBy( id: string, error?: string, hint?: string ): string | undefined {
    if( error ) return `${ id }-error`
    if( hint ) return `${ id }-hint`
    return undefined
}

type TextFieldProps = ComponentProps<"input"> & FieldExtras

function TextField( { label, error, hint, optional, labelAction, wrapperClassName, className, id, ...props }: TextFieldProps ) {
    // useId gives a unique id per field, so label and input stay linked
    // even when the same field is rendered twice on a page.
    const generatedId = useId()
    const fieldId = id ?? generatedId

    return (
        <FieldFrame id={ fieldId } label={ label } error={ error } hint={ hint } optional={ optional } labelAction={ labelAction } className={ wrapperClassName }>
            <input
                id={ fieldId }
                aria-invalid={ error ? true : undefined }
                aria-describedby={ describedBy( fieldId, error, hint ) }
                className={ cn( controlClasses, "h-[46px]", className ) }
                { ...props }
            />
        </FieldFrame>
    )
}

type SelectFieldProps = ComponentProps<"select"> & FieldExtras

// A native <select>: it is accessible and works well on phones for free.
function SelectField( { label, error, hint, optional, labelAction, wrapperClassName, className, id, children, ...props }: SelectFieldProps ) {
    const generatedId = useId()
    const fieldId = id ?? generatedId

    return (
        <FieldFrame id={ fieldId } label={ label } error={ error } hint={ hint } optional={ optional } labelAction={ labelAction } className={ wrapperClassName }>
            <select
                id={ fieldId }
                aria-invalid={ error ? true : undefined }
                aria-describedby={ describedBy( fieldId, error, hint ) }
                className={ cn( controlClasses, "h-[46px]", className ) }
                { ...props }
            >
                { children }
            </select>
        </FieldFrame>
    )
}

type TextareaFieldProps = ComponentProps<"textarea"> & FieldExtras

function TextareaField( { label, error, hint, optional, labelAction, wrapperClassName, className, id, rows = 4, ...props }: TextareaFieldProps ) {
    const generatedId = useId()
    const fieldId = id ?? generatedId

    return (
        <FieldFrame id={ fieldId } label={ label } error={ error } hint={ hint } optional={ optional } labelAction={ labelAction } className={ wrapperClassName }>
            <textarea
                id={ fieldId }
                rows={ rows }
                aria-invalid={ error ? true : undefined }
                aria-describedby={ describedBy( fieldId, error, hint ) }
                className={ cn( controlClasses, "py-3 leading-relaxed", className ) }
                { ...props }
            />
        </FieldFrame>
    )
}

export { TextField, SelectField, TextareaField }
