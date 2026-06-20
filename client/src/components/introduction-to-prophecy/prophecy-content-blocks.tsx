import type { IntroductionToProphecyBlock } from "@shared/introduction-to-prophecy-content";

const SCRIPTURE_BLOCKQUOTE_CLASS =
  "border-l-4 border-amber-500 pl-4 italic text-gray-800 my-6 bg-amber-50 p-4 rounded";

export function renderIntroductionToProphecyBlock(
  block: IntroductionToProphecyBlock,
  index: number,
) {
  if (block.type === "heading") {
    return (
      <h3 key={index} className="text-2xl font-bold text-amber-900 mt-8 mb-4">
        {block.text}
      </h3>
    );
  }

  if (block.type === "scripture") {
    return (
      <blockquote key={index} className={SCRIPTURE_BLOCKQUOTE_CLASS}>
        <p className="font-semibold text-amber-900 mb-3 not-italic">{block.reference}</p>
        <p className="leading-relaxed">{block.text}</p>
      </blockquote>
    );
  }

  if (block.text.startsWith("• ") || block.text.startsWith("- ")) {
    return (
      <div key={index} className="bg-slate-50 border-l-4 border-slate-400 p-4 my-4 rounded">
        <p className="text-gray-800 leading-relaxed">{block.text}</p>
      </div>
    );
  }

  return (
    <p key={index} className="mb-4 text-gray-800 leading-relaxed text-base sm:text-lg">
      {block.text}
    </p>
  );
}

export function getProphecyChapterLabel(title: string, subtitle: string): string {
  if (title === "Introduction") return "Introduction";
  if (subtitle) return `${title}: ${subtitle}`;
  return title;
}

export function getProphecyChapterHeading(title: string, subtitle: string): string {
  if (title === "Introduction") return "Introduction";
  if (subtitle) return `${title.toUpperCase()}: ${subtitle.toUpperCase()}`;
  return title.toUpperCase();
}
