type PlaceholderCardProps = {
  title: string;
  text: string;
};

export function PlaceholderCard({ title, text }: PlaceholderCardProps) {
  return (
    <article className="rounded-[24px] border border-stone-200/80 bg-white/85 p-6 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight text-stone-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-600">{text}</p>
    </article>
  );
}
