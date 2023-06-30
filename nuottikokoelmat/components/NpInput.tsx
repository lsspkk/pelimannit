import React from 'react'

export const NpInput = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
  ...props
}: {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  className?: string
  [x: string]: any
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {label && <label>{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} {...props} />
    </div>
  )
}
