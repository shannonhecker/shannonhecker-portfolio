# Art direction: the case images are presentation slides whose left ~40% is a
# serif title block. On a white, one-grotesk page they read as another brand,
# and their small text is unreadable on a phone. These crops keep only the UI.
# Originals are untouched; crops are written as ui-<name>.jpg next to them.
# Boxes are (left, top, right, bottom) in the 1440x810 source.
import sys
from PIL import Image
BOXES = {
    'fx-cover':      (690, 20, 1440, 690),
    'fx-before':     (560, 20, 1440, 790),
    'fx-users':      (480, 40, 1440, 768),
    'fx-journey':    (520, 30, 1440, 720),
    'fx-loop':       (580, 60, 1440, 780),
    'fx-problem':    (640, 130, 1440, 730),
    'fx-action':     (620, 30, 1440, 745),
    'fx-outcomes':   (560, 200, 1440, 810),
    'fusion-cover':  (700, 0, 1440, 560),
    'fusion-design': (600, 20, 1440, 650),
    'fusion-outcome':(670, 80, 1440, 700),
}
root = sys.argv[1]
for name, box in BOXES.items():
    im = Image.open(f'{root}/{name}.jpg').crop(box)
    im.save(f'{root}/ui-{name}.jpg', quality=92, optimize=True)
    print(name, im.size, round(im.size[0] / im.size[1], 2))
