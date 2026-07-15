export const Spinner = ({ size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-20 w-20 border-6' : 'h-16 w-16 border-4';
  return (
    <div className={`flex items-center justify-center`}>
      <div className={`animate-spin rounded-full ${sizeClass} border-blue-500 border-t-transparent`} />
    </div>
  );
};

export default Spinner;
