import React from 'react'

export const NpTextArea = ({
  label,
  value,
  onChange,
  placeholder,
  className,
  ...props
}: {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  [x: string]: any
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <textarea placeholder={placeholder} value={value} onChange={onChange} {...props} />
    </div>
  )
}
