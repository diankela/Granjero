from PIL import Image, ImageDraw, ImageFont

w, h = 560, 180
img = Image.new('RGBA', (w, h), (255, 255, 255, 0))
d = ImageDraw.Draw(img)
for i in range(40):
    d.arc([20+i, 40+i, w-20-i, int(h*1.1)-i], start=180, end=0, fill=(33, 149, 13, 255), width=10)
leaf_color = (33, 149, 13, 255)
d.polygon([(420, 35), (460, 15), (475, 55)], fill=leaf_color)
d.polygon([(458, 55), (492, 45), (468, 85)], fill=leaf_color)
d.polygon([(450, 20), (490, 40), (470, 75)], outline=leaf_color, fill=None)
try:
    font = ImageFont.truetype('arial.ttf', 72)
except Exception:
    font = ImageFont.load_default()
text = 'GRANJERO'
text_bbox = d.textbbox((0, 0), text, font=font)
text_w = text_bbox[2] - text_bbox[0]
text_h = text_bbox[3] - text_bbox[1]
d.text(((w - text_w) / 2, (h - text_h) / 2 + 10), text, font=font, fill=(4, 74, 1, 255))
img.save('public/granjero-logo.png')
print('created public/granjero-logo.png')
