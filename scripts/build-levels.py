# Builds src/game/levels.ts: Shannon's career as a world map, one level per stage,
# each a short introduce, develop, twist, conclude. Facts on the cards come from
# her CV and her own words; this file only shapes the play.
# Horizontal levels are 17 rows (ground surface row 14, items on row 13).
# The J.P. Morgan tower is a vertical level, 30 columns wide.
# Legend: # solid  = one-way platform  M rate-line platform  D drafted platform
#         o pickup  u second pickup  ^ spikes  B scooter
#         S falling hazard  N circling hazard  P spawn  C checkpoint  F finish
#         E small enemy (the world's own kind; stomp it, missions count them)
H = 17

def new(w, h=H):
    return [[' '] * w for _ in range(h)]

def tools(g, h=H):
    def put(x, y, c): g[y][x] = c
    def ground(a, b, top=14):
        for x in range(a, b):
            for y in range(top, h): put(x, y, '#')
    def plat(a, b, y, c='='):
        for x in range(a, b): put(x, y, c)
    return put, ground, plat

def lvl_kaohsiung():
    # The park, then the scooter, then the city streets down to the sea.
    W = 150; g = new(W); put, ground, plat = tools(g)
    ground(0, 26); put(2, 13, 'P')
    for x in (6, 9): put(x, 13, 'o')
    plat(11, 15, 11); put(13, 10, 'o')
    put(19, 13, 'B')   # hop on the scooter
    ground(29, 60); ground(64, 92); ground(97, 120); ground(125, W)
    for x in (32, 38, 44): put(x, 13, 'o')
    put(50, 13, '^'); put(51, 13, '^')
    plat(55, 60, 10); put(57, 9, 'o')
    put(62, 11, 'o'); put(94, 11, 'o'); put(122, 10, 'o')
    put(64, 13, 'C')
    plat(70, 76, 10); put(72, 9, 'o'); put(74, 9, 'o')
    put(82, 13, '^')
    plat(100, 105, 11); plat(108, 113, 9); put(110, 8, 'o')
    put(116, 13, '^')
    put(125, 13, 'C')
    for x in range(129, 141, 3): put(x, 13, 'o')
    for x in (41, 88, 137): put(x, 13, 'E')   # mosquitoes
    put(146, 13, 'F')
    return g

def lvl_lingtung():
    W = 124; g = new(W); put, ground, plat = tools(g)
    ground(0, 30); put(2, 13, 'P')
    for x in (6, 9, 12): put(x, 13, 'o')
    # sketchbooks end with five tiles of ground before the gap, room to land and jump
    plat(13, 18, 11); put(15, 10, 'o'); plat(19, 24, 9); put(21, 8, 'o')
    put(22, 2, 'S')
    ground(33, 58); put(33, 13, 'C'); put(42, 13, '^'); put(48, 2, 'S')
    for i, y in enumerate((12, 10, 8)):
        plat(60 + i * 5, 64 + i * 5, y); put(62 + i * 5, y - 1, 'o')
    plat(76, 80, 10); plat(82, 86, 12)
    ground(88, W); put(88, 13, 'C'); put(96, 13, '^'); put(102, 2, 'S')
    for x in range(105, 116, 3): put(x, 13, 'o')
    for x in (26, 50, 92, 100): put(x, 13, 'E')   # deadlines
    put(120, 13, 'F')
    return g

def lvl_web():
    W = 124; g = new(W); put, ground, plat = tools(g)
    ground(0, 24); put(2, 13, 'P')
    for x in (6, 9): put(x, 13, 'o')
    plat(13, 18, 11); put(15, 10, 'o')
    ground(27, 50); put(27, 13, 'C'); put(33, 2, 'S'); put(41, 2, 'S')
    for x in (31, 36, 45): put(x, 13, 'o')
    # a staircase of browser windows over a gap
    for i, y in enumerate((12, 10, 8, 10, 12)):
        plat(52 + i * 5, 57 + i * 5, y); put(54 + i * 5, y - 1, 'o')
    ground(79, W); put(79, 13, 'C'); put(88, 13, '^'); put(94, 2, 'S')
    plat(98, 103, 10); put(100, 9, 'o')
    for x in range(106, 117, 3): put(x, 13, 'o')
    for x in (20, 39, 47, 84, 96): put(x, 13, 'E')   # bugs
    put(120, 13, 'F')
    return g

def lvl_london():
    W = 132; g = new(W); put, ground, plat = tools(g)
    ground(0, 28); put(2, 13, 'P')
    for x in (6, 9, 12): put(x, 13, 'o')
    plat(16, 21, 11); put(18, 10, 'o')
    put(24, 8, 'N')
    ground(32, 60); put(32, 13, 'C')
    for i, y in enumerate((12, 10, 8)):
        plat(36 + i * 5, 41 + i * 5, y); put(38 + i * 5, y - 1, 'o')
    put(52, 13, '^'); put(56, 9, 'N')
    plat(62, 67, 11); plat(70, 75, 9); plat(78, 83, 11); put(64, 10, 'o'); put(72, 8, 'o'); put(80, 10, 'o')
    put(72, 4, 'N')
    ground(86, W); put(86, 13, 'C'); put(98, 13, '^'); put(106, 9, 'N')
    for x in range(110, 124, 3): put(x, 13, 'o')
    for x in (22, 48, 92, 104): put(x, 13, 'E')   # pigeons
    put(128, 13, 'F')
    return g

def lvl_tower():
    # A vertical climb, one floor per title. Desks zig-zag up each floor; a gap
    # in each ceiling leads to the next. Floor signs are drawn by the engine.
    W, FLOORS, FH = 30, 4, 15   # top desk sits 3 rows under the ceiling gap
    h = FLOORS * FH + 3
    g = new(W, h); put, ground, plat = tools(g, h)
    labels = []
    titles = ['INTERN · JUNE 2016', 'ANALYST', 'SENIOR ANALYST', 'VICE PRESIDENT · FUSION']
    for x in range(W): put(x, h - 1, '#'); put(x, h - 2, '#')
    for x in range(h): put(0, x, '#'); put(W - 1, x, '#')
    for f in range(FLOORS):
        floor_y = h - 2 - f * FH          # the walking surface row of this floor
        labels.append({'x': 2, 'y': floor_y - 5, 'text': titles[f]})
        put(2 if f % 2 == 0 else W - 3, floor_y - 1, 'C' if f else 'P')
        put(W // 2, floor_y - 1, 'E')   # a meeting invite on every floor
        pick = 'o' if f < 2 else 'u'     # UI and visual first, UX higher up
        # desks climb the floor as an overlapping staircase (each 3 rows up and
        # 5 columns across), left to right on even floors, right to left on odd
        xs = [3 + i * 5 for i in range(4)] if f % 2 == 0 else [W - 10 - i * 5 for i in range(4)]
        for i, (a, dy) in enumerate(zip(xs, (3, 6, 9, 12))):
            plat(a, a + 7, floor_y - dy); put(a + 3, floor_y - dy - 1, pick if i != 2 else ('u' if f == 1 else pick))
        if f < FLOORS - 1:
            ceil = floor_y - FH
            # the way up: an open stairwell over the top two desks, wide enough
            # that the last jumps never bump the ceiling
            gap = range(min(xs[-2], xs[-1]) + 2, max(xs[-2], xs[-1]) + 6)
            for x in range(1, W - 1):
                if x in gap: continue
                put(x, ceil, '#')
            put(14, ceil + 2, 'S')
        else:
            put(W - 4, floor_y - 1, 'F')   # the Fusion dashboard, on the top floor
    return g, labels

def lvl_ai():
    # Platforms over the gaps are drafts until you get close; then they're real.
    W = 124; g = new(W); put, ground, plat = tools(g)
    ground(0, 24); put(2, 13, 'P')
    for x in (6, 9, 12): put(x, 13, 'o')
    plat(26, 31, 12, 'D'); plat(33, 38, 10, 'D'); plat(40, 45, 12, 'D')
    put(28, 11, 'o'); put(35, 9, 'o'); put(42, 11, 'o')
    ground(47, 70); put(47, 13, 'C'); put(58, 9, 'N'); put(64, 13, '^')
    for i, y in enumerate((12, 10, 8, 10)):
        plat(72 + i * 5, 76 + i * 5, y, 'D'); put(74 + i * 5, y - 1, 'o')
    ground(93, W); put(93, 13, 'C'); put(104, 9, 'N')
    for x in range(98, 116, 3): put(x, 13, 'o')
    for x in (18, 52, 96, 117): put(x, 13, 'E')   # hallucinations
    put(120, 13, 'F')
    return g

def lvl_desk():
    W = 176; g = new(W)
    def put(x, y, c): g[y][x] = c
    def ground(a, b, top=14):
        for x in range(a, b):
            for y in range(top, H): put(x, y, '#')
    def plat(a, b, y):
        for x in range(a, b): put(x, y, '=')
    # introduce: run, one small gap, first price dots, first falling sheet far ahead
    ground(0, 16); ground(18, 40); put(2, 13, 'P')
    for x in (6, 9): put(x, 13, 'o')
    for x in (16, 17): put(x, 11, 'o')
    plat(25, 29, 11); put(26, 10, 'o'); put(28, 10, 'o')
    put(34, 2, 'S')
    # develop: widening gaps, candlestick steps, sheets over the floor
    put(40, 13, 'C'); ground(40, 54); ground(57, 68); ground(72, 84); ground(88, 96)
    put(55, 11, 'o'); put(69, 11, 'o'); put(70, 11, 'o'); put(85, 10, 'o'); put(86, 10, 'o')
    put(48, 13, '^'); put(78, 13, '^')
    plat(60, 64, 10); put(61, 9, 'o'); put(63, 9, 'o')
    put(50, 2, 'S'); put(66, 2, 'S'); put(81, 2, 'S')
    # twist: climb, then ride the FX rate line across the pit
    put(90, 13, 'C')
    for i, x in enumerate(range(96, 112, 4)):
        ground(x, x + 4, top=13 - i * 2); put(x + 2, 12 - i * 2, 'o')
    put(110, 6, 'C')
    for x, top in [(114, 9), (119, 10), (124, 10), (129, 11)]:
        for xx in range(x, x + 3): put(xx, top, 'M')
        put(x + 1, top - 3, 'o')
    ground(135, 148); put(141, 13, '^'); put(144, 2, 'S')
    # conclude: a clear run to the terminal
    put(148, 13, 'C'); ground(148, W)
    for x in range(152, 168, 3): put(x, 13, 'o')
    for x in (36, 44, 66, 138, 160): put(x, 13, 'E')   # late changes
    put(172, 13, 'F')
    return g

def lvl_bedtime():
    W = 172; g = new(W)
    def put(x, y, c): g[y][x] = c
    def ground(a, b, top=14):
        for x in range(a, b):
            for y in range(top, H): put(x, y, '#')
    def plat(a, b, y):
        for x in range(a, b): put(x, y, '=')
    # introduce: activity cards as a gentle staircase
    ground(0, 30); put(2, 13, 'P')
    for x in (6, 9, 12): put(x, 13, 'o')
    plat(16, 20, 11); put(18, 10, 'o'); plat(22, 26, 9); put(24, 8, 'o')
    ground(32, 48); put(40, 9, 'N')
    # develop: cards over the gaps, nag clouds circling the stars
    put(32, 13, 'C')
    plat(50, 54, 12); plat(57, 61, 10); plat(64, 68, 12); ground(70, 90)
    put(52, 11, 'o'); put(59, 9, 'o'); put(66, 11, 'o')
    put(59, 6, 'N'); put(80, 10, 'N'); put(76, 13, 'o'); put(84, 13, 'o'); put(80, 13, '^')
    # twist: a tall bedtime ladder of cards, cloud at the top
    put(72, 13, 'C')
    # cards overlap like a staircase: any jump from one reaches the next
    for i, y in enumerate((12, 10, 8, 6)):
        plat(92 + i * 4, 97 + i * 4, y); put(94 + i * 4, y - 1, 'o')
    put(104, 2, 'N')
    plat(110, 114, 7); plat(116, 120, 9); plat(122, 126, 11)
    put(112, 6, 'o'); put(118, 8, 'o'); put(124, 10, 'o')
    ground(128, 148); put(140, 9, 'N')
    # conclude: the Scrollkeeper guards a storybook castle and flag
    put(148, 13, 'C'); ground(148, W)
    for x in range(151, 165, 3): put(x, 13, 'o')
    for x in (27, 44, 88, 134): put(x, 13, 'E')   # screens
    put(166, 13, 'F')
    return g

worlds = [
    ('kaohsiung', lvl_kaohsiung(), []),
    ('lingtung', lvl_lingtung(), []),
    ('web', lvl_web(), []),
    ('london', lvl_london(), []),
    ('tower', *lvl_tower()),
    ('desk', lvl_desk(), []),
    ('ai', lvl_ai(), []),
    ('bedtime', lvl_bedtime(), []),
]
import json
out = ['// Generated by scripts/build-levels.py. Edit that, not this.', '',
       "export type ThemeKey = 'kaohsiung' | 'lingtung' | 'web' | 'london' | 'tower' | 'desk' | 'ai' | 'bedtime';",
       "export const LEVELS: { theme: ThemeKey; rows: string[]; labels: { x: number; y: number; text: string }[] }[] = ["]
for theme, g, labels in worlds:
    # An optional power star on the safe opening stretch, separate from score pickups.
    sy = next(y for y,row in enumerate(g) if 'P' in row)
    sx = g[sy].index('P')
    for dx in range(5,11):
        if g[sy][sx+dx] == ' ' and g[sy+1][sx+dx] == '#':
            g[sy][sx+dx] = '*'
            break
    rows = [''.join(r) for r in g]
    out.append(f"  {{ theme: '{theme}', labels: {json.dumps(labels, ensure_ascii=False)}, rows: [")
    out += [f"    '{r}'," for r in rows]
    out.append('  ] },')
    print(theme.ljust(10), len(rows[0]), 'x', len(rows), '·', sum(r.count('o') + r.count('u') for r in rows), 'pickups')
out.append('];')
open('src/game/levels.ts', 'w').write('\n'.join(out) + '\n')
