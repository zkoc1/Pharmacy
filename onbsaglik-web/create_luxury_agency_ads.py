#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerçek ürün fotoğraflarıyla ajans kalitesinde, lüks 1080x1080 sosyal medya reklam kreatifleri üretir.
Fiyat içermez, modern tipografi, stüdyo ışığı ve 3D podyum gölgelendirmesi içerir.
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

FONT_REGULAR = 'C:/Windows/Fonts/arial.ttf'
FONT_BOLD = 'C:/Windows/Fonts/arialbd.ttf'

def get_font(size, bold=False):
    path = FONT_BOLD if bold else FONT_REGULAR
    return ImageFont.truetype(path, size)

def remove_outer_bg_smooth(img_path):
    """Kenarlardaki beyaz arka planı ayıklar ve yumuşak (antialiased) kenar üretir."""
    img = Image.open(img_path).convert('RGB')
    arr = np.array(img)
    is_white = np.all(arr > 244, axis=-1)
    labeled, _ = ndimage.label(is_white)
    
    border_labels = set()
    border_labels.update(np.unique(labeled[0, :]))
    border_labels.update(np.unique(labeled[-1, :]))
    border_labels.update(np.unique(labeled[:, 0]))
    border_labels.update(np.unique(labeled[:, -1]))
    border_labels.discard(0)
    
    outer_bg = np.isin(labeled, list(border_labels))
    alpha = np.where(outer_bg, 0, 255).astype(np.uint8)
    
    alpha_img = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8))
    
    rgba = img.convert('RGBA')
    rgba.putalpha(alpha_img)
    bbox = rgba.getbbox()
    return rgba.crop(bbox)

def create_studio_background(theme='emerald'):
    """Lüks stüdyo aydınlatması: Yumuşak radyal ışık huzmesi ve zarif gradient"""
    w, h = 1080, 1080
    
    # Renk paletleri
    if theme == 'emerald': # Bioxcin için lüks fildişi / açık adaçayı
        center_color = np.array([255, 255, 255], dtype=float)
        edge_color = np.array([230, 240, 235], dtype=float)
        accent = (16, 145, 100)
        btn_bg = (6, 78, 59)
    elif theme == 'blue': # Alopexy için medikal saf beyaz / buz mavisi
        center_color = np.array([255, 255, 255], dtype=float)
        edge_color = np.array([232, 240, 250], dtype=float)
        accent = (29, 78, 216)
        btn_bg = (30, 58, 138)
    else: # Minoxil için lüks gümüş / safir mavi
        center_color = np.array([255, 255, 255], dtype=float)
        edge_color = np.array([234, 238, 250], dtype=float)
        accent = (67, 56, 202)
        btn_bg = (49, 46, 129)
        
    # Radyal ışık matrisi (Işık merkezi ürünün biraz arkasında: x=700, y=500)
    y, x = np.ogrid[:h, :w]
    light_x, light_y = 680, 480
    dist = np.sqrt((x - light_x)**2 + (y - light_y)**2)
    max_dist = np.sqrt(w**2 + h**2) * 0.75
    norm_dist = np.clip(dist / max_dist, 0, 1)
    
    # Yumuşak eğri (cosine falloff)
    factor = 0.5 * (1 + np.cos(norm_dist * np.pi)) # 1 at center, 0 at edge
    factor = factor[:, :, np.newaxis]
    
    bg_arr = (center_color * factor + edge_color * (1 - factor)).astype(np.uint8)
    canvas = Image.fromarray(bg_arr, mode='RGB')
    
    return canvas, accent, btn_bg

def add_studio_shadow(canvas, x, y, width, height):
    """Gerçekçi çift katmanlı temas ve ortam gölgesi (Ambient Occlusion)"""
    # 1. Katman: Doğrudan taban temas gölgesi (Koyu & Keskin)
    contact = Image.new('RGBA', (width + 40, 40), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(contact)
    cdraw.ellipse([20, 10, width + 20, 30], fill=(15, 23, 42, 130))
    contact = contact.filter(ImageFilter.GaussianBlur(6))
    canvas.paste(contact, (x - 20, y + height - 20), contact)
    
    # 2. Katman: Geniş dağınık stüdyo gölgesi (Yumuşak & Açık)
    diffuse = Image.new('RGBA', (width + 120, 90), (0, 0, 0, 0))
    ddraw = ImageDraw.Draw(diffuse)
    ddraw.ellipse([20, 20, width + 100, 70], fill=(15, 23, 42, 50))
    diffuse = diffuse.filter(ImageFilter.GaussianBlur(22))
    canvas.paste(diffuse, (x - 60, y + height - 45), diffuse)

def add_header(canvas, accent):
    draw = ImageDraw.Draw(canvas)
    
    # Logo
    if os.path.exists(LOGO_PATH):
        try:
            logo = Image.open(LOGO_PATH).convert('RGBA')
            aspect = logo.width / logo.height
            new_h = 56
            new_w = int(new_h * aspect)
            logo_resized = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
            canvas.paste(logo_resized, (60, 50), logo_resized)
        except Exception as e:
            print("Logo hatasi:", e)
            
    # Sağ üst ince şık garanti hapı
    draw.rounded_rectangle([660, 52, 1020, 98], radius=23, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
    draw.text((690, 66), "%100 ORİJİNAL ECZANE GARANTİSİ", font=get_font(15, bold=True), fill=accent)


# =======================================================
# 1. POST: BİOXCİN FORTE (GERÇEK 3'LÜ AVANTAJ KUTUSU)
# =======================================================
def render_bioxcin_ad():
    canvas, accent, btn_bg = create_studio_background(theme='emerald')
    add_header(canvas, accent)
    draw = ImageDraw.Draw(canvas)
    
    # Kategori Üst Başlığı (Tracked)
    draw.text((60, 150), "D E R M O K O Z M E T İ K   S A Ç   B A K I M I", font=get_font(14, bold=True), fill=(100, 116, 139))
    
    # Ana Başlık
    draw.text((60, 185), "BİOXCİN FORTE", font=get_font(48, bold=True), fill=(15, 23, 42))
    draw.text((60, 248), "Yoğun Saç Dökülmesine Karşı\nKlinik Olarak Kanıtlanmış Güç", font=get_font(26, bold=True), fill=(51, 65, 85), spacing=6)

    # İnce ayırıcı çizgi
    draw.line([(60, 335), (460, 335)], fill=(203, 213, 225), width=2)

    # 4 Güçlü Avantaj Maddesi (Sade ve zarif)
    bullets = [
        ("Biocomplex B11 Formülü", "Saç dökülmesini %93'e varan oranda engeller"),
        ("Kökten Uca Besleme", "İncelmiş telleri kalınlaştırır ve güçlendirir"),
        ("Bitkisel & Güvenli", "Paraben içermez, günlük kullanıma uygundur"),
        ("3 Al 2 Öde Fırsatı", "Ekonomik 3x300 ml avantajlı aile boyu paket")
    ]
    
    by = 365
    for title, desc in bullets:
        # Minimalist yeşil nokta
        draw.ellipse([60, by + 6, 74, by + 20], fill=accent)
        draw.text((90, by + 2), title, font=get_font(19, bold=True), fill=(15, 23, 42))
        draw.text((90, by + 28), desc, font=get_font(15, bold=False), fill=(100, 116, 139))
        by += 65

    # Alt Eylem Çubuğu (Lüks Koyu Yeşil Hap)
    draw.rounded_rectangle([60, 920, 1020, 1010], radius=24, fill=btn_bg)
    draw.text((100, 946), "HEMEN KEŞFET  |  onbsaglik.com", font=get_font(24, bold=True), fill=(255, 255, 255))
    draw.text((760, 948), "#onbsaglik", font=get_font(23, bold=True), fill=(167, 243, 208))

    # Gerçek Ürün (Bioxcin Forte 3'lü Paket)
    prod = remove_outer_bg_smooth(os.path.join(REAL_PRODS_DIR, 'bioxcin-forte-3lu.jpg'))
    target_h = 610
    scale = target_h / prod.height
    w = int(prod.width * scale)
    p = prod.resize((w, target_h), Image.Resampling.LANCZOS)
    
    # Sağ tarafa kusursuz yerleşim
    prod_x = 540
    prod_y = 265
    add_studio_shadow(canvas, prod_x, prod_y, w, target_h)
    canvas.paste(p, (prod_x, prod_y), p)
    
    # Sol alt "3 Al 2 Öde" Vurgu Rozeti
    draw.rounded_rectangle([60, 660, 360, 725], radius=16, fill=(239, 68, 68))
    draw.text((85, 680), "3 AL 2 ÖDE KAMPANYASI", font=get_font(18, bold=True), fill=(255, 255, 255))

    out_file = os.path.join(ADS_DIR, 'post_bioxcin_real.jpg')
    canvas.save(out_file, 'JPEG', quality=96)
    print("Oluşturuldu:", out_file)


# =======================================================
# 2. POST: PIERRE FABRE ALOPEXY %5 (GERÇEK KUTU & ŞİŞE)
# =======================================================
def render_alopexy_ad():
    canvas, accent, btn_bg = create_studio_background(theme='blue')
    add_header(canvas, accent)
    draw = ImageDraw.Draw(canvas)
    
    draw.text((60, 150), "T I B B İ   S A Ç   T E D A V İ S İ", font=get_font(14, bold=True), fill=(100, 116, 139))
    draw.text((60, 185), "ALOPEXY'T %5", font=get_font(48, bold=True), fill=(15, 23, 42))
    draw.text((60, 248), "Pierre Fabre Dermatologie\n%5 Minoksidil Saç & Deri Spreyi (60 ml)", font=get_font(24, bold=True), fill=(51, 65, 85), spacing=6)

    draw.line([(60, 335), (460, 335)], fill=(203, 213, 225), width=2)

    bullets = [
        ("Dermatolojik Altın Standart", "Androjenik Alopesi (Erkek tipi dökülme) tedavisinde kanıtlanmış"),
        ("Saç Köklerini Canlandırır", "Mikrodolaşımı hızlandırarak yeni saç çıkışını tetikler"),
        ("Hedefli Sprey Başlık", "Seyrelen bölgelere doğrudan ve kolay uygulama"),
        ("Resmi Ecza Deposu Garantisi", "Fransa menşeili, Sağlık Bakanlığı onaylı orijinal ürün")
    ]
    
    by = 365
    for title, desc in bullets:
        draw.ellipse([60, by + 6, 74, by + 20], fill=accent)
        draw.text((90, by + 2), title, font=get_font(19, bold=True), fill=(15, 23, 42))
        draw.text((90, by + 28), desc, font=get_font(15, bold=False), fill=(100, 116, 139))
        by += 65

    draw.rounded_rectangle([60, 920, 1020, 1010], radius=24, fill=btn_bg)
    draw.text((100, 946), "HEMEN İNCELE  |  onbsaglik.com", font=get_font(24, bold=True), fill=(255, 255, 255))
    draw.text((760, 948), "#onbsaglik", font=get_font(23, bold=True), fill=(191, 219, 254))

    # Gerçek Ürün (Pierre Fabre Alopexy 5% Kutu & Şişe)
    prod = remove_outer_bg_smooth(os.path.join(REAL_PRODS_DIR, 'alopexy-5-sprey.jpg'))
    target_h = 600
    scale = target_h / prod.height
    w = int(prod.width * scale)
    p = prod.resize((w, target_h), Image.Resampling.LANCZOS)
    
    prod_x = 510
    prod_y = 265
    add_studio_shadow(canvas, prod_x, prod_y, w, target_h)
    canvas.paste(p, (prod_x, prod_y), p)
    
    # Fransız Dermatoloji Rozeti
    draw.rounded_rectangle([60, 660, 420, 725], radius=16, fill=(37, 99, 235))
    draw.text((85, 680), "FRANSA DERMATOLOJİ MENŞEİLİ", font=get_font(17, bold=True), fill=(255, 255, 255))

    out_file = os.path.join(ADS_DIR, 'post_alopexy_real.jpg')
    canvas.save(out_file, 'JPEG', quality=96)
    print("Oluşturuldu:", out_file)


# =======================================================
# 3. POST: MİNOXİL FORTE %5 (GERÇEK TÜRK ECZANE KUTUSU)
# =======================================================
def render_minoxil_ad():
    canvas, accent, btn_bg = create_studio_background(theme='indigo')
    add_header(canvas, accent)
    draw = ImageDraw.Draw(canvas)
    
    draw.text((60, 150), "K L İ N İ K   S A Ç   Ç I K A R I C I", font=get_font(14, bold=True), fill=(100, 116, 139))
    draw.text((60, 185), "MİNOXİL FORTE %5", font=get_font(48, bold=True), fill=(15, 23, 42))
    draw.text((60, 248), "Dökülen Saçlarınızı Geri Kazanın!\nSağlık Bakanlığı Onaylı Deri Spreyi (60 ml)", font=get_font(24, bold=True), fill=(51, 65, 85), spacing=6)

    draw.line([(60, 335), (460, 335)], fill=(203, 213, 225), width=2)

    bullets = [
        ("Saç Foliküllerini Canlandırır", "Zayıflamış kökleri güçlendirerek saç dökülmesini durdurur"),
        ("Yeni Saç Çıkışını Tetikler", "Tüy görünümündeki telleri kalın saçlara dönüştürür"),
        ("Türkiye'nin En Çok Tercih Edileni", "Eczacıların ve uzman hekimlerin güvenle önerdiği formül"),
        ("Resmi Karekodlu Eczane Güvencesi", "Piyasadaki taklitlerine karşı %100 orijinal teslimat")
    ]
    
    by = 365
    for title, desc in bullets:
        draw.ellipse([60, by + 6, 74, by + 20], fill=accent)
        draw.text((90, by + 2), title, font=get_font(19, bold=True), fill=(15, 23, 42))
        draw.text((90, by + 28), desc, font=get_font(15, bold=False), fill=(100, 116, 139))
        by += 65

    draw.rounded_rectangle([60, 920, 1020, 1010], radius=24, fill=btn_bg)
    draw.text((100, 946), "HEMEN SİPARİŞ VER  |  onbsaglik.com", font=get_font(24, bold=True), fill=(255, 255, 255))
    draw.text((760, 948), "#onbsaglik", font=get_font(23, bold=True), fill=(199, 210, 254))

    # Gerçek Ürün (Minoxil Forte 5% Mavi Kutu)
    prod = remove_outer_bg_smooth(os.path.join(REAL_PRODS_DIR, 'minoxil-forte-60ml.jpg'))
    target_h = 610
    scale = target_h / prod.height
    w = int(prod.width * scale)
    p = prod.resize((w, target_h), Image.Resampling.LANCZOS)
    
    prod_x = 570
    prod_y = 260
    add_studio_shadow(canvas, prod_x, prod_y, w, target_h)
    canvas.paste(p, (prod_x, prod_y), p)
    
    # 1 Numara Rozeti
    draw.rounded_rectangle([60, 660, 420, 725], radius=16, fill=(67, 56, 202))
    draw.text((85, 680), "TÜRKİYE'NİN 1 NUMARALI TERCİHİ", font=get_font(17, bold=True), fill=(255, 255, 255))

    out_file = os.path.join(ADS_DIR, 'post_minoxil_real.jpg')
    canvas.save(out_file, 'JPEG', quality=96)
    print("Oluşturuldu:", out_file)


if __name__ == '__main__':
    render_bioxcin_ad()
    render_alopexy_ad()
    render_minoxil_ad()
    print("Ajans kalitesinde lüks reklam postları hazırlandı!")
