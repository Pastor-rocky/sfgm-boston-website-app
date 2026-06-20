#!/usr/bin/env python3
"""Build Introduction to Prophecy chapter content from pymupdf-extracted text."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "shared/introduction-to-prophecy-content/book-pymupdf.txt"
OUT_JSON = ROOT / "shared/introduction-to-prophecy-content/chapters.json"
OUT_TS = ROOT / "shared/introduction-to-prophecy-content.ts"

LESSON_HEADER_RE = re.compile(r"^Lesson\s+(\d+)\s*:\s*(.+)$", re.IGNORECASE)

SCRIPTURE_REF_RE = re.compile(
    r"^((?:[1-3]\s*)?(?:Revelation|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|"
    r"Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song|Isaiah|Jeremiah|"
    r"Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|"
    r"Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|"
    r"Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s+\d+:\d+(?:-\d+)?)"
    r"(?:\s*\([^)]+\))?\s*[:\.]?\s*(.*)$",
    re.IGNORECASE,
)

INLINE_QUOTE_RE = re.compile(
    r"((?:[1-3]\s*)?(?:Revelation|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|"
    r"Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song|Isaiah|Jeremiah|"
    r"Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|"
    r"Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|"
    r"Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s+\d+:\d+(?:-\d+)?"
    r"(?:\s*\([A-Z]+\))?)\s*"
    r"(?:reminds us that|tells us that|tells us|says that|says|reads|is written|declares|writes|asks|"
    r"commands|warns|prophesied|quoted|records)?\s*"
    r'"([^"]+)"',
    re.IGNORECASE,
)

FULFILLMENT_RE = re.compile(
    r"fulfilled in|referenced in|confirmed in|seen in|prophesied in Matthew|prophesied in Luke",
    re.IGNORECASE,
)

SKIP_LINE_RE = re.compile(r"^---PAGE---$|^●$")

LESSON_SUBTITLES = {
    1: "Prophecies Concerning Jesus",
    2: "Replacement Theology",
    3: "The 70 Weeks of Daniel",
    4: "The Parables",
    5: "The Seven Ordained Feasts",
    6: "The Seven Churches",
    7: "The Ancient Wedding and Gypsy Customs",
    8: "The Millennial Kingdom",
    9: "The Master Key",
}


def load_lines() -> list[str]:
    raw = SOURCE.read_text(encoding="utf-8")
    lines = []
    for line in raw.splitlines():
        s = line.strip()
        if not s or SKIP_LINE_RE.match(s):
            continue
        lines.append(s)
    return lines


def is_lesson_header_line(line: str) -> bool:
    return bool(LESSON_HEADER_RE.match(line))


def find_lesson_starts(lines: list[str]) -> list[tuple[int, int, str]]:
    """Return (lesson_number, 0-based_index, subtitle) for each real lesson body."""
    starts: list[tuple[int, int, str]] = []
    for i, line in enumerate(lines):
        match = LESSON_HEADER_RE.match(line)
        if not match:
            continue
        prev_is_lesson = i > 0 and is_lesson_header_line(lines[i - 1])
        next_is_lesson = i + 1 < len(lines) and is_lesson_header_line(lines[i + 1])
        if prev_is_lesson or next_is_lesson:
            continue
        lesson_num = int(match.group(1))
        subtitle = match.group(2).strip().rstrip(".")
        starts.append((lesson_num, i, subtitle))
    return starts


def is_section_header(line: str) -> bool:
    if len(line) > 90:
        return False
    if is_lesson_header_line(line):
        return False
    if line.startswith("Conclusion:"):
        return False
    if line.endswith(".") and line.count(".") == 1 and len(line) < 40:
        return False
    letters = re.sub(r"[^A-Za-z]", "", line)
    if not letters or len(letters) < 6:
        return False
    upper_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
    if upper_ratio > 0.85 and len(letters) >= 8:
        return True
    if line.endswith(":") and upper_ratio > 0.6:
        return True
    return False


def join_wrapped_lines(lines: list[str]) -> list[str]:
    paragraphs: list[str] = []
    current = ""
    for line in lines:
        if is_section_header(line):
            if current.strip():
                paragraphs.append(current.strip())
                current = ""
            paragraphs.append(f"@@HEADING@@{line.rstrip(':').strip()}")
            continue
        if not current:
            current = line
            continue
        if current.endswith("-") or line[0].islower() or (not re.search(r"[.!?]$", current) and len(current) < 120):
            current = current.rstrip("-") + (" " if not current.endswith("-") else "") + line
        else:
            paragraphs.append(current.strip())
            current = line
    if current.strip():
        paragraphs.append(current.strip())
    return paragraphs


def parse_scripture(text: str):
    match = SCRIPTURE_REF_RE.match(text.strip())
    if not match:
        return None
    reference, body = match.group(1).strip(), (match.group(2) or "").strip()
    if FULFILLMENT_RE.search(body):
        return None
    if not body:
        return None
    if body[0] in ",.;:":
        return None
    if re.match(r"^(tells us|reminds us|He would|The |Peter|and Psalm)", body, re.IGNORECASE):
        return None
    return {"type": "scripture", "reference": reference, "text": body}


def extract_inline_quoted_scriptures(paragraph: str) -> list[dict]:
    blocks: list[dict] = []
    last = 0
    for match in INLINE_QUOTE_RE.finditer(paragraph):
        before = paragraph[last : match.start()].strip()
        if before:
            blocks.append({"type": "paragraph", "text": before})
        blocks.append(
            {
                "type": "scripture",
                "reference": match.group(1).strip(),
                "text": f'"{match.group(2).strip()}"',
            }
        )
        last = match.end()
    tail = paragraph[last:].strip()
    if tail:
        blocks.append({"type": "paragraph", "text": tail})
    return blocks


EMBEDDED_HEADING_RE = re.compile(
    r"^([A-Z][A-Z0-9 ',/&()\-]{6,}?)\s+((?:In |The |When |Here |This |We |God |Over |Peter |For |At |By |A |An |Revelation|First |Finally |Welcome |One |Deep |Your |All |How ).+)$"
)


def split_embedded_headers(paragraphs: list[str]) -> list[str]:
    out: list[str] = []
    for para in paragraphs:
        if para.startswith("@@HEADING@@"):
            out.append(para)
            continue
        match = EMBEDDED_HEADING_RE.match(para)
        if match and len(match.group(1)) < 72:
            out.append(f"@@HEADING@@{match.group(1).strip()}")
            out.append(match.group(2).strip())
        else:
            out.append(para)
    return out


def clean_intro_paragraphs(paragraphs: list[str]) -> list[str]:
    cleaned: list[str] = []
    for para in paragraphs:
        if para.startswith("Introduction to prophecy INTRODUCTION TO PROPHECY"):
            continue
        if para.startswith("Copyright 2026 SFGM Ministries"):
            para = para.replace("Copyright 2026 SFGM Ministries", "").strip()
            if not para:
                continue
        if para.startswith("PREFACE "):
            para = para.replace("PREFACE ", "", 1)
        cleaned.append(para)
    return cleaned


def filter_intro_lines(chunk_lines: list[str]) -> list[str]:
    filtered: list[str] = []
    skip_toc = False
    for line in chunk_lines:
        if is_lesson_header_line(line):
            continue
        if line.startswith("TABLE OF CONTENTS"):
            skip_toc = True
            continue
        if skip_toc:
            if line.startswith("Are you ready"):
                skip_toc = False
                filtered.append(line)
            continue
        if line.startswith("Conclusion: Final Words"):
            continue
        filtered.append(line)
    return filtered


def filter_lesson_lines(chunk_lines: list[str]) -> list[str]:
    filtered: list[str] = []
    for line in chunk_lines:
        if is_lesson_header_line(line):
            continue
        filtered.append(line)
    return filtered


def merge_split_scripture_quotes(blocks: list[dict]) -> list[dict]:
    merged: list[dict] = []
    i = 0
    while i < len(blocks):
        block = blocks[i]
        if (
            block["type"] == "scripture"
            and block["text"].strip().startswith('"')
            and not block["text"].strip().endswith('"')
        ):
            combined = block["text"].strip()
            reference = block["reference"]
            i += 1
            while i < len(blocks) and blocks[i]["type"] == "paragraph":
                combined += " " + blocks[i]["text"].strip()
                i += 1
                if combined.rstrip().endswith('"'):
                    break
            merged.append({"type": "scripture", "reference": reference, "text": combined})
            continue
        merged.append(block)
        i += 1
    return merged


KJV_INLINE_RE = re.compile(
    r"^((?:(?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:\s*[-–]\s*\d+)?"
    r"(?:\s*,\s*\d+)?(?:\s+through\s+\d+)?))\s*\(KJV\):\s*(.+)$",
    re.IGNORECASE | re.DOTALL,
)


def merge_kjv_passages(blocks: list[dict]) -> list[dict]:
    merged: list[dict] = []
    i = 0
    while i < len(blocks):
        block = blocks[i]
        if block["type"] != "paragraph":
            merged.append(block)
            i += 1
            continue

        match = KJV_INLINE_RE.match(block["text"].strip())
        if not match:
            merged.append(block)
            i += 1
            continue

        reference = f"{match.group(1).strip()} (KJV)"
        combined = match.group(2).strip()
        if not combined.startswith('"'):
            combined = f'"{combined}'
        i += 1

        while i < len(blocks) and blocks[i]["type"] == "paragraph" and not combined.rstrip().endswith(
            '"'
        ):
            combined += " " + blocks[i]["text"].strip()
            i += 1

        if not combined.rstrip().endswith('"'):
            combined = combined.rstrip() + '"'

        merged.append({"type": "scripture", "reference": reference, "text": combined})
    return merged


def paragraphs_to_blocks(paragraphs: list[str]) -> list[dict]:
    blocks: list[dict] = []
    for para in paragraphs:
        if para.startswith("@@HEADING@@"):
            blocks.append({"type": "heading", "text": para.replace("@@HEADING@@", "")})
            continue

        if INLINE_QUOTE_RE.search(para):
            blocks.extend(extract_inline_quoted_scriptures(para))
            continue

        scripture = parse_scripture(para)
        if scripture:
            blocks.append(scripture)
            continue

        blocks.append({"type": "paragraph", "text": para})

    return blocks


def build_chapters(lines: list[str]) -> list[dict]:
    lesson_starts = find_lesson_starts(lines)
    if not lesson_starts:
        raise RuntimeError("No lesson headers found in source text")

    chapters: list[dict] = []

    intro_lines = lines[: lesson_starts[0][1]]
    intro_paragraphs = join_wrapped_lines(filter_intro_lines(intro_lines))
    intro_paragraphs = split_embedded_headers(intro_paragraphs)
    intro_paragraphs = clean_intro_paragraphs(intro_paragraphs)
    intro_blocks = merge_kjv_passages(
        merge_split_scripture_quotes(paragraphs_to_blocks(intro_paragraphs))
    )
    chapters.append(
        {
            "id": 1,
            "title": "Introduction",
            "subtitle": "",
            "blocks": intro_blocks,
        }
    )

    for idx, (lesson_num, start_index, subtitle) in enumerate(lesson_starts):
        end_index = lesson_starts[idx + 1][1] if idx + 1 < len(lesson_starts) else len(lines)
        chunk_lines = lines[start_index:end_index]
        paragraphs = join_wrapped_lines(filter_lesson_lines(chunk_lines))
        paragraphs = split_embedded_headers(paragraphs)
        blocks = merge_kjv_passages(merge_split_scripture_quotes(paragraphs_to_blocks(paragraphs)))
        chapters.append(
            {
                "id": lesson_num + 1,
                "title": f"Lesson {lesson_num}",
                "subtitle": LESSON_SUBTITLES.get(lesson_num, subtitle),
                "blocks": blocks,
            }
        )

    for i, chapter in enumerate(chapters, start=1):
        chapter["id"] = i

    return chapters


def ts_escape(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def emit_ts(chapters: list[dict]) -> str:
    lines = [
        "// Auto-generated by scripts/build-introduction-to-prophecy-content.py",
        "// Do not edit by hand.",
        "",
        'export type IntroductionToProphecyBlock =',
        '  | { type: "paragraph"; text: string }',
        '  | { type: "heading"; text: string }',
        '  | { type: "scripture"; reference: string; text: string };',
        "",
        "export type IntroductionToProphecyChapter = {",
        "  id: number;",
        "  title: string;",
        "  subtitle: string;",
        "  blocks: IntroductionToProphecyBlock[];",
        "};",
        "",
        "export const INTRODUCTION_TO_PROPHECY_AUDIO_FILES: Record<number, string> = {",
    ]
    for ch in chapters:
        num = ch["id"]
        if num == 1:
            fname = "Introduction to Prophecy - Introduction.mp3"
        else:
            fname = f"Introduction to Prophecy - Lesson {num - 1}.mp3"
        lines.append(f"  {num}: {ts_escape(fname)},")
    lines.append("};")
    lines.append("")
    lines.append("export const introductionToProphecyChapters: IntroductionToProphecyChapter[] = ")
    lines.append(json.dumps(chapters, indent=2, ensure_ascii=False) + ";")
    lines.append("")
    return "\n".join(lines)


def main():
    lines = load_lines()
    chapters = build_chapters(lines)
    OUT_JSON.write_text(json.dumps(chapters, indent=2, ensure_ascii=False), encoding="utf-8")
    OUT_TS.write_text(emit_ts(chapters), encoding="utf-8")
    print(f"Wrote {len(chapters)} chapters to {OUT_TS}")
    for ch in chapters:
        print(f"  {ch['id']:2d}. {ch['title']}: {len(ch['blocks'])} blocks")


if __name__ == "__main__":
    main()
