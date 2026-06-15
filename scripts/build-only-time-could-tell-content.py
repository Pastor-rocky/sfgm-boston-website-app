#!/usr/bin/env python3
"""Build Only Time Could Tell chapter content from pymupdf-extracted text."""

import json
import re
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "shared/only-time-could-tell-content/book-pymupdf.txt"
OUT_JSON = ROOT / "shared/only-time-could-tell-content/chapters.json"
OUT_TS = ROOT / "shared/only-time-could-tell-content.ts"

SCRIPTURE_REF_RE = re.compile(
    r"^((?:[1-3]\s*)?[A-Za-z]+\s+\d+:\d+(?:-\d+)?)\s*(.*)$",
    re.DOTALL,
)
ROMAN_NUMERAL_RE = re.compile(r"^[ivxlcdm]+$", re.IGNORECASE)
CHAPTER_MARKER_RE = re.compile(r"^CHAPTER\s+(\d+)\s+b\s*(.*)$", re.IGNORECASE | re.MULTILINE)


def strip_noise_lines(text: str) -> str:
    lines = text.splitlines()
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned.append("")
            continue
        if stripped in {"W", "w"}:
            continue
        if re.fullmatch(r"\d+", stripped):
            continue
        if ROMAN_NUMERAL_RE.fullmatch(stripped):
            continue
        if stripped.startswith("_") and len(stripped) > 10:
            continue
        cleaned.append(line.rstrip())
    return "\n".join(cleaned)


def normalize_spaces(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def fix_hyphenation(text: str) -> str:
    return re.sub(r"(\w)-\s+(\w)", r"\1\2", text)


def is_section_header(line: str) -> bool:
    stripped = line.strip()
    if not stripped or len(stripped) > 72:
        return False
    if stripped.startswith("~") and stripped.endswith("~"):
        return False
    if stripped.endswith(":") and not stripped.startswith('"'):
        if len(stripped) > 36:
            return False
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
            r"^(What|If|Think|Listen|Many|You|This|When|An|Please|Pastors|I |No |God)\b",
            line,
        ):
            return False
        return False
    return True


def title_case_header(text: str) -> str:
    cleaned = text.strip().rstrip(".")
    letters = re.sub(r"[^A-Za-z]", "", cleaned)
    if letters and letters.upper() == letters:
        return re.sub(r"'S", "'s", cleaned.title())
    return cleaned


def parse_scripture(text: str) -> Optional[dict]:
    match = SCRIPTURE_REF_RE.match(text.strip())
    if not match:
        return None
    reference, body = match.group(1).strip(), match.group(2).strip()
    if not body:
        return None
    return {"type": "scripture", "reference": reference, "text": body}


def parse_blocks(body: str) -> list[dict]:
    body = re.sub(r"~ NOTES ~.*", "", body, flags=re.IGNORECASE | re.DOTALL)
    body = re.sub(r"_+\s*$", "", body, flags=re.MULTILINE)

    blocks: list[dict] = []
    paragraph_lines: list[str] = []
    bullet_lines: list[str] = []

    def flush_paragraph():
        nonlocal paragraph_lines
        if not paragraph_lines:
            return
        text = fix_hyphenation(" ".join(paragraph_lines).strip())
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
            item = fix_hyphenation(item)
            scripture = parse_scripture(item)
            if scripture:
                blocks.append(scripture)
            else:
                blocks.append({"type": "paragraph", "text": f"• {item}"})
        bullet_lines = []

    for raw_line in body.splitlines():
        line = raw_line.strip()
        if not line or line.lower() == "w":
            flush_paragraph()
            flush_bullets()
            continue

        if line.startswith("~") and line.endswith("~"):
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

        if paragraph_lines and re.search(r'[.!?"]\s*$', paragraph_lines[-1]) and line[0].isupper():
            flush_paragraph()

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
                combined = fix_hyphenation(f"{current['text']} {nxt['text']}".strip())
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
        r"^(.+?[.!?\"])(?:\s+)((?:What |If |Think |Listen |So |Please |Many |An |You |This |When |I ).+)$",
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
                if not text or text in {"•", "...", "w"}:
                    continue
                if text.startswith("Scripture quotes taken"):
                    continue
                text = re.sub(
                    r"\s*Anthony Lee\s*Scripture quotes taken from.*$",
                    "",
                    text,
                    flags=re.IGNORECASE,
                ).strip()
                if text.startswith("Scripture quotes taken"):
                    continue
                if re.match(r"^_{5,}", text):
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


def resolve_chapter_title(match: re.Match, body: str) -> tuple[str, str]:
    title = match.group(2).strip().rstrip(".")
    remaining = body

    if title:
        return title, remaining

    lines = remaining.splitlines()
    index = 0
    while index < len(lines):
        candidate = lines[index].strip()
        index += 1
        if not candidate or candidate.lower() == "w":
            continue
        title = candidate.rstrip(".")
        remaining = "\n".join(lines[index:])
        break

    return title, remaining


def split_chapters(text: str) -> list[dict]:
    text = strip_noise_lines(text)
    text = normalize_spaces(text)

    intro_matches = list(
        re.finditer(r"\nIntroduction & Personal Testimony\s*\n", text, re.IGNORECASE)
    )
    if not intro_matches:
        raise RuntimeError("Could not find introduction marker")
    intro_match = intro_matches[-1]

    content = text[intro_match.end() :]
    matches = list(CHAPTER_MARKER_RE.finditer(content))
    if not matches:
        raise RuntimeError("Could not find chapter markers")

    chapters: list[dict] = [
        {
            "id": 1,
            "title": "Introduction",
            "subtitle": "Personal Testimony",
            "blocks": parse_blocks(content[: matches[0].start()].strip()),
        }
    ]

    chapter_id = 2
    for index, match in enumerate(matches):
        num = match.group(1)
        body_end = matches[index + 1].start() if index + 1 < len(matches) else len(content)
        raw_body = content[match.end() : body_end]
        subtitle, body = resolve_chapter_title(match, raw_body)
        subtitle = title_case_header(subtitle)
        subtitle = re.sub(r"['\u2019]S", "'s", subtitle)

        if num == "19" or subtitle.upper() == "CONCLUSION":
            body = re.split(r"\n\d+And whatever you do", body, maxsplit=1, flags=re.IGNORECASE)[0]
            chapters.append(
                {
                    "id": chapter_id,
                    "title": "Conclusion",
                    "subtitle": "",
                    "blocks": parse_blocks(body.strip()),
                }
            )
        else:
            chapters.append(
                {
                    "id": chapter_id,
                    "title": f"Chapter {num}",
                    "subtitle": subtitle,
                    "blocks": parse_blocks(body.strip()),
                }
            )
        chapter_id += 1

    return chapters


def write_ts(chapters: list[dict]) -> None:
    payload = json.dumps(chapters, ensure_ascii=False, indent=2)
    OUT_TS.write_text(
        f"""// Auto-generated by scripts/build-only-time-could-tell-content.py
// Do not edit by hand.

export type OnlyTimeCouldTellBlock =
  | {{ type: "paragraph"; text: string }}
  | {{ type: "heading"; text: string }}
  | {{ type: "scripture"; reference: string; text: string }};

export type OnlyTimeCouldTellChapter = {{
  id: number;
  title: string;
  subtitle: string;
  blocks: OnlyTimeCouldTellBlock[];
}};

export const onlyTimeCouldTellChapters: OnlyTimeCouldTellChapter[] = {payload} as const;
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
        label = f"{ch['title']}: {ch['subtitle']}" if ch["subtitle"] else ch["title"]
        print(f"  - {ch['id']}: {label} ({len(ch['blocks'])} blocks)")


if __name__ == "__main__":
    main()
