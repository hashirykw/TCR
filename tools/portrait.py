"""Make faculty cutout portraits: python3 tools/portrait.py <src> <slug> [--no-rembg]
Removes the background (rembg, unless the source already has alpha), trims to the subject,
crops head-to-chest, and writes assets/img/faculty/<slug>.webp (640h) + <slug>-lg.webp (960h)
plus a 160px face crop <slug>-face.webp for avatar rows."""
import sys, io
from PIL import Image, ImageFilter
src, slug = sys.argv[1], sys.argv[2]
im = Image.open(src)
im = im.convert('RGBA')
alpha = im.getchannel('A')
needs_cut = alpha.getextrema()[0] == 255 and '--no-rembg' not in sys.argv
if needs_cut:
    from rembg import remove, new_session
    im = remove(im, session=new_session('isnet-general-use'), alpha_matting=True,
                alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=12, alpha_matting_erode_size=8)
    im = im.convert('RGBA')
# trim to subject
a = im.getchannel('A').point(lambda v: 255 if v > 24 else 0)
bb = a.getbbox(); im = im.crop(bb)
w, h = im.size
# head-to-chest: keep a frame ~1.25x as tall as wide (portrait cards), anchored at top
keep = min(h, int(w * 1.25))
im = im.crop((0, 0, w, keep))
# clean faint halo
r, g, b, al = im.split()
al = al.point(lambda v: 0 if v < 10 else v)
im = Image.merge('RGBA', (r, g, b, al))
out = 'assets/img/faculty/'
for suffix, H in (('', 640), ('-lg', 960)):
    t = im.resize((round(im.width * H / im.height), H), Image.LANCZOS) if im.height > H else im
    t.save(f'{out}{slug}{suffix}.webp', 'WEBP', quality=84, method=6)
# face crop for avatar rows: top ~45% of the frame, centred square
fw = int(im.width * .62); fx = (im.width - fw) // 2
face = im.crop((fx, 0, fx + fw, fw)).resize((160, 160), Image.LANCZOS)
bg = Image.new('RGBA', face.size, (0, 0, 0, 0)); bg.alpha_composite(face)
bg.save(f'{out}{slug}-face.webp', 'WEBP', quality=84, method=6)
print(slug, im.size)
