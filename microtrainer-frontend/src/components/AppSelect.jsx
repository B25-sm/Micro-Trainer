/**
 * Native select with global app-select styles (readable options in dark mode).
 * Pass className for layout only (width, margin); colors come from index.css.
 */
export default function AppSelect({ className = "", children, ...props }) {
  return (
    <select className={`app-select ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}
