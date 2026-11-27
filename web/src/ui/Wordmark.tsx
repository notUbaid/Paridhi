/** Text wordmark used until the brand logo is supplied. */
export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className="inline-flex items-baseline gap-2 select-none">
      <span className={`font-display font-bold text-ink tracking-tight ${size === 'lg' ? 'text-3xl' : 'text-2xl'}`}>
        Paridhi
      </span>
      <span className={`font-deva text-accent ${size === 'lg' ? 'text-xl' : 'text-body hidden sm:inline'}`} lang="hi">
        परिधि
      </span>
    </span>
  );
}
