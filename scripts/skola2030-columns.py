"""Split the Annex 6 table (PDF pages 48-56) into its three stage columns
using word coordinates from `pdftotext -bbox`."""
import html, re, sys

src = open(sys.argv[1], encoding="utf-8").read()
pages = src.split("<page ")[1:]
COLS = [(0, 210), (210, 370), (370, 1000)]  # beidzot 3. / 6. / 9. klasi
out = {0: [], 1: [], 2: [], "span": []}
seen_on_page: dict = {}
for page_no, p in enumerate(pages):
    words = [
        (float(a), float(b), float(c), html.unescape(w))
        for a, b, c, w in re.findall(r'xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="[\d.]+">([^<]*)</word>', p)
    ]
    lines = {}
    for x0, y0, x1, w in words:
        key = round(y0)
        k = next((k for k in lines if abs(k - key) <= 1), key)
        lines.setdefault(k, []).append((x0, x1, w))
    for y in sorted(lines):
        ws = sorted(lines[y])
        segs, cur = [], [ws[0]]
        for prev, nxt in zip(ws, ws[1:]):
            # Cells are left-aligned at the column edges (x = 218.19, 376.87).
            at_edge = any(abs(nxt[0] - e) < 0.05 for e in (218.190214, 376.871902))
            if nxt[0] - prev[1] > 12 or at_edge:
                segs.append(cur); cur = [nxt]
            else:
                cur.append(nxt)
        segs.append(cur)
        for s in segs:
            start, end = s[0][0], s[-1][1]
            text = " ".join(w for _, _, w in s)
            col = next(i for i, (a, b) in enumerate(COLS) if a <= start < b)
            if re.fullmatch(r"\d+/100", text):
                continue  # page footer
            if end > COLS[col][1] + 8:
                out["span"].append(text)  # full-width heading
                continue
            # likumi.lv repeats a cell's last line at the top of the next page.
            if out[col] and seen_on_page.get(col) != page_no and out[col][-1] == text:
                seen_on_page[col] = page_no
                continue
            seen_on_page[col] = page_no
            out[col].append(text)
names = ["BEIDZOT 3. KLASI", "BEIDZOT 6. KLASI", "BEIDZOT 9. KLASI"]
for i in range(3):
    print(f"===== {names[i]} =====")
    print("\n".join(out[i]))
print("===== VIRSRAKSTI (pāri visām kolonnām) =====")
print("\n".join(out["span"]))
