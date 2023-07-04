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
      <input
        className='px-[2px] focus:border focus:border-cyan-300 focus-visible:border-cyan-300 focus-visible:border'
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  )
}
