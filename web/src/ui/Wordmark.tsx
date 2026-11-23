/** Text wordmark used until the brand logo is supplied. */
export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className="inline-flex items-baseline gap-2 select-none">
      <span className={`font-display font-semibold text-ink tracking-tight ${size === 'lg' ? 'text-3xl' : 'text-[22px]'}`}>
        Paridhi
      </span>
      <span className={`font-deva text-accent ${size === 'lg' ? 'text-xl' : 'text-[15px] hidden sm:inline'}`} lang="hi">
        परिधि
      </span>
    </span>
  );
}
