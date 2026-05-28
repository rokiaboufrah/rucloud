import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth.models import User
from products.models import Collection, Category, Product, ProductSize, ProductColor

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@rucloud.dz', 'admin123')
    print('Superuser: admin / admin123')

Collection.objects.get_or_create(name="Spring '26", slug='spring-26', defaults={'order': 1})
Collection.objects.get_or_create(name='Essentials', slug='essentials', defaults={'order': 2})

cat_names = ['Abayas', 'Sets', 'Dresses', 'Tops', 'Pants', 'Scarves', 'Accessories']
cats = {}
for i, name in enumerate(cat_names, 1):
    c, _ = Category.objects.get_or_create(name=name, slug=name.lower(), defaults={'order': i})
    cats[name.lower()] = c

products = [
    ('Shadow Abaya', 'shadow-abaya', 24000, 'abayas',
     'Crafted from premium Japanese crepe, the Shadow Abaya features a minimalist silhouette with intricate hand-stitched details.',
     'Japanese crepe', 'Dry clean only'),
    ('Cloud Set', 'cloud-set', 18000, 'sets',
     'A two-piece set that effortlessly transitions from day to night. The flowing silhouette creates an ethereal look.',
     'Viscose blend', 'Hand wash cold'),
    ('Resilience Dress', 'resilience-dress', 21000, 'dresses',
     'A sculptural dress embodying strength and grace. Architectural pleating and fluid fabric tell a story of perseverance.',
     'Premium crepe', 'Dry clean recommended'),
    ('Noir Pants', 'noir-pants', 12000, 'pants',
     'Tailored with precision, these wide-leg pants drape elegantly. The deep noir shade anchors any ensemble.',
     'Wool blend', 'Dry clean only'),
    ('Ivory Pull', 'ivory-pull', 15000, 'tops',
     'An effortless pullover with oversized fit and dropped shoulders. The ivory hue brings light to any look.',
     'Cashmere blend', 'Hand wash cold'),
    ('Silk Scarf', 'silk-scarf', 4500, 'scarves',
     'Hand-rolled edges and liquid silk drape define this essential accessory. A whisper of elegance.',
     '100% silk', 'Dry clean only'),
]

size_map = {'abayas': ['XS','S','M','L','XL'], 'sets': ['S','M','L'], 'dresses': ['XS','S','M','L','XL'],
            'tops': ['S','M','L'], 'pants': ['S','M','L','XL'], 'scarves': ['One Size'], 'accessories': ['One Size']}

for name, slug, price, cat_slug, desc, material, care in products:
    p, created = Product.objects.get_or_create(slug=slug, defaults={
        'name': name, 'price': price, 'category': cats[cat_slug],
        'description': desc, 'material': material, 'care_instructions': care,
        'is_featured': True, 'is_active': True,
    })
    for sz in size_map[cat_slug]:
        ProductSize.objects.get_or_create(product=p, name=sz, defaults={'stock': 10})

    colors_data = {
        'shadow-abaya': [('Noir', '#1A1008'), ('Sage', '#8A9E7A')],
        'cloud-set': [('Ivory', '#F0E6D3'), ('Mauve', '#C4A0A8')],
        'resilience-dress': [('Espresso', '#3B2A1F'), ('Noir', '#1A1008')],
        'noir-pants': [('Noir', '#1A1008')],
        'ivory-pull': [('Ivory', '#F0E6D3'), ('Sage', '#8A9E7A')],
        'silk-scarf': [('Mauve', '#C4A0A8'), ('Ivory', '#F0E6D3'), ('Noir', '#1A1008')],
    }
    for color_name, hex_code in colors_data.get(slug, []):
        ProductColor.objects.get_or_create(product=p, name=color_name, defaults={'hex_code': hex_code, 'stock': 10})

    print(f'  {name}')

print('Seed complete!')
