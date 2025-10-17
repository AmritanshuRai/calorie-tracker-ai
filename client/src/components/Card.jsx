export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-neutral-200 ${
        onClick
          ? 'cursor-pointer hover:shadow-md transition-all duration-200'
          : ''
      } ${className}`}>
      {children}
    </div>
  );
}
