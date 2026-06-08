import { cn } from '../../lib/utils'

export default function Button({ children, variant = 'primary', className, ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white hover:shadow-lg hover:scale-105',
    secondary: 'border border-white/20 text-white hover:bg-white/10',
    outline: 'border border-[#F4620A] text-[#F4620A] hover:bg-[#F4620A]/10',
    ghost: 'text-[#A0A0B8] hover:text-white',
  }

  return (
    <button
      className={cn(
        'px-6 py-3 rounded-full font-medium transition-all duration-300',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}