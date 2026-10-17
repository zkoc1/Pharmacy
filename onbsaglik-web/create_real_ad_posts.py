#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerçek sitemizdeki ürün fotoğraflarını kullanarak kusursuz, iki kolonlu (metin sol / ürün sağ) 
1080x1080 profesyonel reklam postları oluşturur.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
from scipy import ndimage

PUBLIC_DIR = 'public'
ADS_DIR = os.path.join(PUBLIC_DIR, 'ads')
REAL_PRODS_DIR = os.path.join(PUBLIC_DIR, 'real_products')
LOGO_PATH = os.path.join(PUBLIC_DIR, 'logo.png')

os.makedirs(ADS_DIR, exist_ok=True)

# Windows fontları
FONT_REGULAR = 'C:/Windows/Fonts/arial.ttf'
FONT_BOLD = 'C:/Windows/Fonts/arialbd.ttf'

def get_font(size, bold=False):
    path = FONT_BOLD if bold else FONT_REGULAR
    return ImageFont.truetype(path, size)

def remove_outer_bg(img_path):
    """Kenarlara temas eden saf beyaz arka planı saydamlaştırır."""
    img = Image.open(img_path).convert('RGB')
    arr = np.array(img)
    is_white = np.all(arr > 245, axis=-1)
    labeled, _ = ndimage.label(is_white)
    
    border_labels = set()
    border_labels.update(np.unique(labeled[0, :]))
    border_labels.update(np.unique(labeled[-1, :]))
    border_labels.update(np.unique(labeled[:, 0]))
    border_labels.update(np.unique(labeled[:, -1]))
    border_labels.discard(0)
    
    outer_bg = np.isin(labeled, list(border_labels))
    alpha = np.where(outer_bg, 0, 255).astype(np.uint8)
    
    rgba = img.convert('RGBA')
    rgba.putalpha(Image.fromarray(alpha))
    bbox = rgba.getbbox()
    return rgba.crop(bbox)

def draw_checkmark(draw, x, y, color=(255, 255, 255)):
    draw.line([(x, y + 5), (x + 4, y + 10)], fill=color, width=3)
    draw.line([(x + 4, y + 10), (x + 12, y + 2)], fill=color, width=3)

def create_base_canvas(theme='emerald'):
    w, h = 1080, 1080
    canvas = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    if theme == 'emerald':
        top_color = (248, 252, 250)
        bottom_color = (226, 245, 236)
        accent_color = (16, 185, 129)
        btn_color = (5, 150, 105)
    elif theme == 'blue':
        top_color = (248, 250, 255)
        bottom_color = (225, 238, 255)
        accent_color = (37, 99, 235)
        btn_color = (29, 78, 216)
    else: # Indigo (Minoxil)
        top_color = (248, 249, 255)
        bottom_color = (228, 234, 254)
        accent_color = (79, 70, 229)
        btn_color = (67, 56, 202)

    for y in range(h):
        ratio = y / h
        r = int(top_color[0] * (1 - ratio) + bottom_color[0] * ratio)
        g = int(top_color[1] * (1 - ratio) + bottom_color[1] * ratio)
        b = int(top_color[2] * (1 - ratio) + bottom_color[2] * ratio)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
        
    return canvas, accent_color, btn_color

def add_header(canvas, accent_color):
    draw = ImageDraw.Draw(canvas)
    if os.path.exists(LOGO_PATH):
        try:
            logo = Image.open(LOGO_PATH).convert('RGBA')
            aspect = logo.width / logo.height
            new_h = 54
            new_w = int(new_h * aspect)
            logo_resized = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
            canvas.paste(logo_resized, (50, 44), logo_resized)
        except Exception as e:
            print("Logo hatasi:", e)
    
    # Sağ üst garanti rozeti
    draw.rounded_rectangle([640, 46, 1030, 94], radius=24, fill=(255, 255, 255), outline=accent_color, width=2)
    draw.text((665, 61), "%100 ORİJİNAL ECZANE GARANTİSİ", font=get_font(15, bold=True), fill=accent_color)

def add_drop_shadow(canvas, x, y, width, height):
    shadow_mask = Image.new('RGBA', (width + 60, 70), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_mask)
    sdraw.ellipse([20, 15, width + 40, 55], fill=(0, 0, 0, 50))
    shadow_blurred = shadow_mask.filter(ImageFilter.GaussianBlur(15))
    canvas.paste(shadow_blurred, (x - 30, y + height - 35), shadow_blurred)


# ==========================================
# 1. POST: BIOXCIN KAMPANYA GÖRSELİ
# ==========================================
def create_bioxcin_post():
    canvas, accent, btn_color = create_base_canvas(theme='emerald')
    add_header(canvas, accent)
    draw = ImageDraw.Draw(canvas)
    
    # Rozet
    draw.rounded_rectangle([50, 128, 410, 168], radius=10, fill=(220, 252, 231), outline=(16, 185, 129), width=2)
    draw.text((68, 140), "3 AL 2 ÖDE & %20 İNDİRİM FIRSATI", font=get_font(14, bold=True), fill=(6, 95, 70))
    
    # Başlık
    draw.text((50, 185), "Saç Dökülmesine Karşı\nKlinik Formül: Bioxcin", font=get_font(38, bold=True), fill=(17, 24, 39), spacing=7)
    draw.text((50, 285), "Orijinal Forte & Quantum 3'lü Avantaj Paketleri", font=get_font(18, bold=False), fill=(75, 85, 99))

    # Özellikler (Kısa & Öz)
    features = [
        "Biocomplex B11 ile %93 Dökülme Karşıtı Etki",
        "Zayıflayan Kökleri Besler ve Kalınlaştırır",
        "Paraben İçermez, Günlük Kullanıma Uygun",
        "Karekodlu, Faturalı ve %100 Orijinal Eczane"
    ]
    
    fy = 345
    for feat in features:
        draw.ellipse([50, fy + 2, 72, fy + 24], fill=(16, 185, 129))
        draw_checkmark(draw, 55, fy + 6)
        draw.text((84, fy + 2), feat, font=get_font(17, bold=True), fill=(31, 41, 55))
        fy += 48

    # Fiyat & Kampanya Kutusu
    draw.rounded_rectangle([50, 570, 480, 690], radius=18, fill=(255, 255, 255), outline=(16, 185, 129), width=2)
    draw.text((72, 588), "KAMPANYALI BAŞLANGIÇ FİYATI", font=get_font(13, bold=True), fill=(107, 114, 128))
    draw.text((72, 612), "₺425,00", font=get_font(40, bold=True), fill=(5, 150, 105))
    draw.text((255, 628), "(3 Al 2 Öde Paketler)", font=get_font(15, bold=False), fill=(75, 85, 99))

    # Alt Satın Alma Barı
    draw.rounded_rectangle([50, 920, 1030, 1010], radius=22, fill=btn_color)
    draw.text((85, 946), "HEMEN SİPARİŞ VER -> onbsaglik.com", font=get_font(25, bold=True), fill=(255, 255, 255))
    draw.text((740, 948), "#onbsaglik", font=get_font(24, bold=True), fill=(209, 250, 229))

    # Gerçek Ürün Fotoğrafı (Sağ blok)
    prod1 = remove_outer_bg(os.path.join(REAL_PRODS_DIR, 'bioxcin-forte-3lu.jpg'))
    target_h = 580
    scale1 = target_h / prod1.height
    w1 = int(prod1.width * scale1)
    p1 = prod1.resize((w1, target_h), Image.Resampling.LANCZOS)
    
    add_drop_shadow(canvas, 580, 290, w1, target_h)
    canvas.paste(p1, (580, 290), p1)
    
    # 3 AL 2 ÖDE Rozeti
    draw.ellipse([885, 210, 1025, 350], fill=(239, 68, 68), outline=(255, 255, 255), width=4)
    draw.text((908, 250), "3 AL 2 ÖDE", font=get_font(18, bold=True), fill=(255, 255, 255))
    draw.text((912, 282), "%20 İNDİRİM", font=get_font(15, bold=True), fill=(255, 255, 255))

    out_path = os.path.join(ADS_DIR, 'post_bioxcin_real.jpg')
    canvas.save(out_path, 'JPEG', quality=95)
    print("Oluşturuldu:", out_path)


# ==========================================
# 2. POST: PIERRE FABRE ALOPEXY %5 GÖRSELİ
# ==========================================
def create_alopexy_post():
    canvas, accent, btn_color = create_base_canvas(theme='blue')
    add_header(canvas, accent)
    draw = ImageDraw.Draw(canvas)
    
    # Rozet
    draw.rounded_rectangle([50, 128, 410, 168], radius=10, fill=(219, 234, 254), outline=(37, 99, 235), width=2)
    draw.text((68, 140), "DERMATOLOJİK TEDAVİ FORMÜLÜ", font=get_font(14, bold=True), fill=(30, 58, 138))
    
    # Başlık
    draw.text((50, 185), "Pierre Fabre Alopexy't %5\nSaç & Deri Spreyi (60 ml)", font=get_font(38, bold=True), fill=(17, 24, 39), spacing=7)
    draw.text((50, 285), "Genetik ve Bölgesel Seyrelmeye Karşı Tıbbi Çözüm", font=get_font(18, bold=False), fill=(75, 85, 99))

    features = [
        "Fransa Pierre Fabre Dermatologie Güvencesi",
        "%5 Minoksidil ile Kanıtlanmış Saç Çıkartıcı Etki",
        "Saç Köklerini Uyandırır ve Canlandırır",
        "Özel Dozajlı Başlık ile Kolay Uygulama",
        "Resmi Ecza Depolarından Faturalı ve Orijinal"
    ]
    
    fy = 345
    for feat in features:
        draw.ellipse([50, fy + 2, 72, fy + 24], fill=(37, 99, 235))
        draw_checkmark(draw, 55, fy + 6)
        draw.text((84, fy + 2), feat, font=get_font(17, bold=True), fill=(31, 41, 55))
        fy += 48

    # Fiyat Kutusu
    draw.rounded_rectangle([50, 600, 470, 720], radius=18, fill=(255, 255, 255), outline=(37, 99, 235), width=2)
    draw.text((72, 618), "SİTEMİZDEKİ GÜNCEL FİYAT", font=get_font(13, bold=True), fill=(107, 114, 128))
    draw.text((72, 642), "₺359,00", font=get_font(40, bold=True), fill=(37, 99, 235))
    draw.text((255, 658), "(Aynı Gün Kargo)", font=get_font(15, bold=False), fill=(75, 85, 99))

    # Alt Satın Alma Barı
    draw.rounded_rectangle([50, 920, 1030, 1010], radius=22, fill=btn_color)
    draw.text((85, 946), "HEMEN SATIN AL -> onbsaglik.com", font=get_font(25, bold=True), fill=(255, 255, 255))
    draw.text((740, 948), "#onbsaglik", font=get_font(24, bold=True), fill=(219, 234, 254))

    # Gerçek Ürün Fotoğrafı
    prod = remove_outer_bg(os.path.join(REAL_PRODS_DIR, 'alopexy-5-sprey.jpg'))
    target_h = 570
    scale = target_h / prod.height
    w = int(prod.width * scale)
    p = prod.resize((w, target_h), Image.Resampling.LANCZOS)
    
    add_drop_shadow(canvas, 550, 275, w, target_h)
    canvas.paste(p, (550, 275), p)

    out_path = os.path.join(ADS_DIR, 'post_alopexy_real.jpg')
    canvas.save(out_path, 'JPEG', quality=95)
    print("Oluşturuldu:", out_path)


# ==========================================
# 3. POST: MINOXIL FORTE %5 GÖRSELİ
# ==========================================
def create_minoxil_post():
    canvas, accent, btn_color = create_base_canvas(theme='indigo')
    add_header(canvas, accent)
    draw = ImageDraw.Draw(canvas)
    
    # Rozet
    draw.rounded_rectangle([50, 128, 440, 168], radius=10, fill=(238, 242, 255), outline=(79, 70, 229), width=2)
    draw.text((68, 140), "TÜRKİYE'NİN 1 NUMARALI SAÇ ÇIKARICISI", font=get_font(14, bold=True), fill=(67, 56, 202))
    
    # Başlık
    draw.text((50, 185), "Minoxil Forte %5 Deri Spreyi\n(60 ml) - Bakanlık Onaylı", font=get_font(38, bold=True), fill=(17, 24, 39), spacing=7)
    draw.text((50, 285), "Dökülen Saçlarınızı Geri Kazanın! Klinik Olarak Kanıtlanmış", font=get_font(18, bold=False), fill=(75, 85, 99))

    features = [
        "Erkek Tipi Saç Dökülmesinde Altın Standart",
        "Saç Köklerini Canlandırır ve Dökülmeyi Durdurur",
        "İncelmiş Telleri Kalın Saçlara Dönüştürür",
        "Piyasadaki Sahtelerine Karşı %100 Orijinal",
        "Gizli Paketleme & Hızlı Teslimat Güvencesi"
    ]
    
    fy = 345
    for feat in features:
        draw.ellipse([50, fy + 2, 72, fy + 24], fill=(79, 70, 229))
        draw_checkmark(draw, 55, fy + 6)
        draw.text((84, fy + 2), feat, font=get_font(17, bold=True), fill=(31, 41, 55))
        fy += 48

    # Fiyat Kutusu
    draw.rounded_rectangle([50, 600, 470, 720], radius=18, fill=(255, 255, 255), outline=(79, 70, 229), width=2)
    draw.text((72, 618), "SİTEMİZDEKİ GÜNCEL FİYAT", font=get_font(13, bold=True), fill=(107, 114, 128))
    draw.text((72, 642), "₺629,99", font=get_font(40, bold=True), fill=(67, 56, 202))
    draw.text((255, 658), "(Orijinal Kutulu)", font=get_font(15, bold=False), fill=(75, 85, 99))

    # Alt Satın Alma Barı
    draw.rounded_rectangle([50, 920, 1030, 1010], radius=22, fill=btn_color)
    draw.text((85, 946), "HEMEN SİPARİŞ VER -> onbsaglik.com", font=get_font(25, bold=True), fill=(255, 255, 255))
    draw.text((740, 948), "#onbsaglik", font=get_font(24, bold=True), fill=(224, 231, 255))

    # Gerçek Ürün Fotoğrafı
    prod = remove_outer_bg(os.path.join(REAL_PRODS_DIR, 'minoxil-forte-60ml.jpg'))
    target_h = 580
    scale = target_h / prod.height
    w = int(prod.width * scale)
    p = prod.resize((w, target_h), Image.Resampling.LANCZOS)
    
    add_drop_shadow(canvas, 600, 275, w, target_h)
    canvas.paste(p, (600, 275), p)

    out_path = os.path.join(ADS_DIR, 'post_minoxil_real.jpg')
    canvas.save(out_path, 'JPEG', quality=95)
    print("Oluşturuldu:", out_path)

if __name__ == '__main__':
    create_bioxcin_post()
    create_alopexy_post()
    create_minoxil_post()
    print("Tüm gönderiler hatasız ve kusursuz üretildi!")
