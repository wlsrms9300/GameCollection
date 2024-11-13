import React, { createContext, useContext, InputHTMLAttributes } from 'react'

interface TextContextType {
  id: string
}

const TextContext = createContext<TextContextType | undefined>(undefined)

interface TextProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
}

const Text: React.FC<TextProps> & {
  Label: typeof TextLabel
  Input: typeof TextInput
  Error: typeof TextError
} = ({ id, children, ...props }) => {
  return (
    <TextContext.Provider value={{ id }}>
      <div className="mb-4">{children}</div>
    </TextContext.Provider>
  )
}

const TextLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  children,
  ...props
}) => {
  const context = useContext(TextContext)
  if (!context) throw new Error('TextLabel은 Text 컴포넌트 내에서 사용해야 합니다.')

  return (
    <label htmlFor={context.id} className="block text-sm font-medium text-gray-700 mb-1" {...props}>
      {children}
    </label>
  )
}

const TextInput: React.FC<Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>> = (props) => {
  const context = useContext(TextContext)
  if (!context) throw new Error('TextInput은 Text 컴포넌트 내에서 사용해야 합니다.')

  return (
    <input
      id={context.id}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      {...props}
    />
  )
}

const TextError: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  ...props
}) => {
  return (
    <p className="mt-1 text-sm text-red-600" {...props}>
      {children}
    </p>
  )
}

Text.Label = TextLabel
Text.Input = TextInput
Text.Error = TextError

export default Text
