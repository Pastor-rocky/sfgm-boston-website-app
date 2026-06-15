#!/usr/bin/env python3
"""Build Choosing Your Future chapter content from pymupdf-extracted text."""

import json
import re
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "shared/choosing-your-future-content/book-pymupdf.txt"
OUT_JSON = ROOT / "shared/choosing-your-future-content/chapters.json"
OUT_TS = ROOT / "shared/choosing-your-future-content.ts"

SCRIPTURE_REF_RE = re.compile(
    r"^((?:[1-3]\s*)?[A-Za-z]+\s+\d+:\d+(?:-\d+)?)\s*(.*)$",
    re.DOTALL,
)


def strip_page_numbers(text: str) -> str:
    lines = text.splitlines()
    cleaned = []
    for line in lines:
        if re.fullmatch(r"\d+", line.strip()):
            continue
        cleaned.append(line.rstrip())
    return "\n".join(cleaned)


def normalize_spaces(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def is_section_header(line: str) -> bool:
    stripped = line.strip()
    if not stripped or len(stripped) > 72:
        return False
    if stripped.endswith(":") and not stripped.startswith('"'):
        if len(stripped) < 14 and not stripped.isupper():
            return False
        return True
    letters = re.sub(r"[^A-Za-z]", "", stripped)
    return bool(letters) and letters.upper() == letters and len(letters) > 4


def is_bullet_continuation(line: str, current_bullet: str) -> bool:
    bullet = current_bullet.strip()
    if not bullet:
        return False
    if line[0].islower():
        return True
    if bullet.count('"') % 2 == 1:
        return True
    if re.search(r"[.!?]\s*$", bullet):
        if re.match(r"^(But|And|Or|For|Nor|Yet|So)\b", line):
            return True
        if re.match(
            r"^(What|If|Think|Listen|Many|You|This|When|An|Please|Pastors)\b",
            line,
        ):
            return False
        return False
    return True


def title_case_header(text: str) -> str:
    if text.isupper():
        return text.title()
    return text.rstrip(":")


def parse_scripture(text: str) -> Optional[dict]:
    match = SCRIPTURE_REF_RE.match(text.strip())
    if not match:
        return None
    reference, body = match.group(1).strip(), match.group(2).strip()
    if not body:
        return None
    return {"type": "scripture", "reference": reference, "text": body}


def parse_blocks(body: str) -> list[dict]:
    blocks: list[dict] = []
    paragraph_lines: list[str] = []
    bullet_lines: list[str] = []

    def flush_paragraph():
        nonlocal paragraph_lines
        if not paragraph_lines:
            return
        text = " ".join(paragraph_lines).strip()
        paragraph_lines = []
        if not text:
            return
        scripture = parse_scripture(text)
        if scripture:
            blocks.append(scripture)
        elif is_section_header(text):
            blocks.append({"type": "heading", "text": title_case_header(text)})
        else:
            blocks.append({"type": "paragraph", "text": text})

    def flush_bullets():
        nonlocal bullet_lines
        if not bullet_lines:
            return
        for item in bullet_lines:
            scripture = parse_scripture(item)
            if scripture:
                blocks.append(scripture)
            else:
                blocks.append({"type": "paragraph", "text": f"• {item}"})
        bullet_lines = []

    for raw_line in body.splitlines():
        line = raw_line.strip()
        if not line:
            flush_paragraph()
            flush_bullets()
            continue

        if line.startswith("•"):
            flush_paragraph()
            bullet_lines.append(line.lstrip("•").strip())
            continue

        if bullet_lines:
            if is_bullet_continuation(line, bullet_lines[-1]):
                bullet_lines[-1] = f"{bullet_lines[-1]} {line}".strip()
            else:
                flush_bullets()
                paragraph_lines.append(line)
            continue

        if is_section_header(line):
            flush_paragraph()
            blocks.append({"type": "heading", "text": title_case_header(line)})
            continue

        paragraph_lines.append(line)

    flush_paragraph()
    flush_bullets()
    return polish_blocks(merge_continuations(blocks))


def merge_continuations(blocks: list[dict]) -> list[dict]:
    merged: list[dict] = []
    i = 0
    while i < len(blocks):
        current = blocks[i]
        if (
            i + 1 < len(blocks)
            and current["type"] == "paragraph"
            and not re.search(r'[.!?"]\s*$', current["text"])
            and len(current["text"]) < 120
        ):
            nxt = blocks[i + 1]
            if nxt["type"] in ("heading", "paragraph"):
                combined = f"{current['text']} {nxt['text']}".strip()
                scripture = parse_scripture(combined)
                if scripture:
                    merged.append(scripture)
                else:
                    merged.append({"type": "paragraph", "text": combined})
                i += 2
                continue
        merged.append(current)
        i += 1
    return merged


def split_scripture_commentary(block: dict) -> list[dict]:
    if block.get("type") != "scripture":
        return [block]
    match = re.match(
        r"^(.+?[.!?\"])(?:\s+)((?:What |If |Think |Listen |So |Please |Many |An |You |This |When ).+)$",
        block["text"],
        re.DOTALL,
    )
    if match:
        return [
            {
                "type": "scripture",
                "reference": block["reference"],
                "text": match.group(1).strip(),
            },
            {"type": "paragraph", "text": match.group(2).strip()},
        ]
    return [block]


def polish_blocks(blocks: list[dict]) -> list[dict]:
    polished: list[dict] = []
    for block in blocks:
        for piece in split_scripture_commentary(block):
            if piece["type"] == "paragraph":
                text = piece["text"].strip()
                if not text or text in {"•", "..."}:
                    continue
                polished.append({"type": "paragraph", "text": text})
            elif piece["type"] == "heading":
                text = piece["text"].strip()
                if not text:
                    continue
                polished.append({"type": "heading", "text": text})
            else:
                polished.append(piece)
    return polished


def split_chapters(text: str) -> list[dict]:
    text = strip_page_numbers(text)
    text = normalize_spaces(text)

    intro_match = re.search(
        r"\nChoosing Your Future\s*\n\s*Introduction:\s*\n",
        text,
        flags=re.IGNORECASE,
    )
    if not intro_match:
        raise RuntimeError("Could not find introduction marker")

    remainder = text[intro_match.end() :]

    chapter_pattern = re.compile(
        r"Chapter\s+(\d+)\s*:?\s*\n([^\n]+)\n",
        flags=re.IGNORECASE,
    )

    parts = chapter_pattern.split(remainder)

    chapters: list[dict] = [
        {
            "id": 1,
            "title": "Introduction",
            "subtitle": "",
            "blocks": parse_blocks(parts[0].strip()),
        },
    ]

    chapter_id = 2
    for i in range(1, len(parts), 3):
        num = parts[i]
        subtitle = parts[i + 1].strip().rstrip(".")
        body = parts[i + 2].strip() if i + 2 < len(parts) else ""

        conclusion_split = re.split(r"\nConclusion\s*\n", body, maxsplit=1, flags=re.IGNORECASE)
        chapter_body = conclusion_split[0].strip()
        conclusion_body = conclusion_split[1].strip() if len(conclusion_split) > 1 else ""

        chapters.append(
            {
                "id": chapter_id,
                "title": f"Chapter {num}",
                "subtitle": subtitle,
                "blocks": parse_blocks(chapter_body),
            }
        )
        chapter_id += 1

        if conclusion_body and num == "15":
            chapters.append(
                {
                    "id": chapter_id,
                    "title": "Conclusion",
                    "subtitle": "",
                    "blocks": parse_blocks(conclusion_body),
                }
            )
            chapter_id += 1

    return chapters


def write_ts(chapters: list[dict]) -> None:
    payload = json.dumps(chapters, ensure_ascii=False, indent=2)
    OUT_TS.write_text(
        f"""// Auto-generated by scripts/build-choosing-your-future-content.py
// Do not edit by hand.

export type ChoosingYourFutureBlock =
  | {{ type: "paragraph"; text: string }}
  | {{ type: "heading"; text: string }}
  | {{ type: "scripture"; reference: string; text: string }};

export type ChoosingYourFutureChapter = {{
  id: number;
  title: string;
  subtitle: string;
  blocks: ChoosingYourFutureBlock[];
}};

export const choosingYourFutureChapters: ChoosingYourFutureChapter[] = {payload} as const;
""",
        encoding="utf-8",
    )


def main() -> None:
    text = SOURCE.read_text(encoding="utf-8")
    chapters = split_chapters(text)
    OUT_JSON.write_text(json.dumps(chapters, ensure_ascii=False, indent=2), encoding="utf-8")
    write_ts(chapters)
    print(f"Wrote {len(chapters)} chapters")
    for ch in chapters:
        label = ch["subtitle"] or ch["title"]
        print(f"  - {ch['id']}: {label} ({len(ch['blocks'])} blocks)")


if __name__ == "__main__":
    main()
