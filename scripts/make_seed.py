"""Generates supabase/seed.sql from the two catalogues (PRIDE Feb 2025, RAJAT by Rajlaxmi).
Prices are intentionally left empty: set them in the admin panel."""
import re, json

def slugify(s):
    s = s.lower().replace('&', 'and')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def q(v):
    if v is None: return 'null'
    return "'" + str(v).replace("'", "''") + "'"

def arr(a):
    if not a: return "'{}'"
    return "array[" + ",".join(q(x) for x in a) + "]::text[]"

cats = [
  ('mixer-grinders','Mixer Grinders','Home mixer grinders with stainless steel jars.'),
  ('hotel-mixer-grinders','Hotel Mixer Grinders','Heavy-duty mixer grinders for hotels, restaurants and commercial kitchens.'),
  ('blenders-choppers','Blenders & Choppers','Nutri blenders, hand blenders, madhani and electric choppers.'),
  ('juicers','Juicers','Juice machines and hand press juicers.'),
  ('gas-stoves-cooktops','Gas Stoves & Cooktops','LPG gas stoves and infrared cooktops.'),
  ('electric-kettles','Electric Kettles','Stainless steel electric kettles.'),
  ('irons','Electric Irons','Dry irons (press) with adjustable temperature control.'),
  ('coolers-fans','Coolers & Fans','Air coolers for the home.'),
  ('casseroles','Insulated Casseroles','Insulated casseroles to keep food hot.'),
  ('kadai','Kadai & Tasla','Stainless steel kadai and tasla.'),
  ('saucepans','Saucepans','Stainless steel saucepans, plain and copper bottom.'),
  ('topes','Topes & Pots','Stainless steel topes, handi, prabhuchetty and pots.'),
  ('flatware','Plates & Flatware','Stainless steel plates, khumcha, tat, parat and bowls.'),
  ('frypans','Fry Pans','Stainless steel fry pans.'),
  ('tiffins','Tiffins & Food Carriers','Stainless steel kadi tiffins and food carriers.'),
  ('storageware','Storageware','Dibba, basins and storage tasla.'),
  ('cookware-sets','Cookware Gift Sets','Boxed copper bottom pot sets.'),
  ('lids-covers','Lids & Covers','Stainless steel covers for saucepans and pots.'),
  ('brass-utensils','Brass Utensils','Brass utensils.'),
]

products = []
def add(**k): products.append(k)

# ------------------------------------------------------------ PRIDE (SLM Home Products)
W = lambda n: f'{n} W'
def mixer(name, watts, yrs, jars, cat='mixer-grinders', extra=None, feat_extra=None, hotel=False, sku=None):
    warranty = f'{yrs} year' + ('s' if str(yrs) != '1' else '') if not hotel else '6 months'
    feats = [f'{watts} W motor', jars, '3-speed control', 'Stainless steel blades', f'{warranty} warranty on motor']
    if feat_extra: feats.insert(2, feat_extra)
    specs = {'Power': f'{watts} W', 'Jars': jars, 'Speed control': '3 speed', 'Blade': 'Stainless steel', 'Warranty': f'{warranty} on motor'}
    if extra: specs.update(extra)
    add(name=name, brand='Pride', cat=cat, sku=sku,
        desc=f'Pride {name} with a {watts} W motor and {jars.lower()}. Comes with {warranty} warranty on the motor.',
        features=feats, specs=specs)

mixer('Comet Mixer Grinder', 550, 1, '1 stainless steel jar')
mixer('Sleek Mixer Grinder', 550, 2, '2 stainless steel jars')
mixer('Super Sonic Mixer Grinder', 500, 1, '2 stainless steel jars + 3 polycarbonate jars', feat_extra=None)
mixer('Alpine Mixer Grinder', 550, 2, '3 stainless steel jars')
mixer('Delta Mixer Grinder', 550, 2, '3 stainless steel jars')
mixer('Delta Plus Mixer Grinder', 550, 2, '3 stainless steel jars')
mixer('Wall-E Mixer Grinder', 750, 2, '3 stainless steel jars')
mixer('Strom Mixer Grinder', 750, 2, '3 stainless steel jars')
mixer('Seltos Mixer Grinder', 750, 2, '3 stainless steel jars')
mixer('Machine Mixer Grinder', 800, 5, '3 stainless steel jars')
mixer('Cadillac Mixer Grinder', 800, 5, '3 stainless steel jars')
mixer('Breeza Mixer Grinder', 850, 5, '3 stainless steel jars')
mixer('Rover Mixer Grinder', 850, 5, '3 stainless steel jars')
mixer('Cadillac Plus Mixer Grinder with Filter', 800, 5, '3 stainless steel jars + 1 juicer jar')
mixer('Thunder Mixer Grinder', 1000, 5, '3 stainless steel jars')
for n, w in [('Hotel King', 1400), ('Steel Kraft', 1500), ('Hotel King', 1600), ('Steel Kraft', 1800), ('Hotel King', 2200)]:
    mixer(f'{n} Hotel Mixer Grinder ({w} W)', w, 0, '2 stainless steel jars', cat='hotel-mixer-grinders', hotel=True)

add(name='Nutri Mix Nutri Blender', brand='Pride', cat='blenders-choppers',
    desc='Pride Nutri Mix nutri blender with a 450 W motor and 2 polycarbonate jars. 1 year warranty on the motor.',
    features=['450 W motor','2 polycarbonate jars','1-speed control','Stainless steel blade','1 year warranty on motor'],
    specs={'Power':'450 W','Jars':'2 polycarbonate','Speed control':'1 speed','Blade':'Stainless steel','Warranty':'1 year on motor'})
add(name='Nutri Mix Nutri Blender with Sipper Bottle', brand='Pride', cat='blenders-choppers',
    desc='Pride Nutri Mix nutri blender with a 450 W motor, 2 polycarbonate jars and a sipper bottle. 1 year warranty on the motor.',
    features=['450 W motor','2 polycarbonate jars','1 sipper bottle','1-speed control','Stainless steel blade','1 year warranty on motor'],
    specs={'Power':'450 W','Jars':'2 polycarbonate','Bottle':'1 sipper','Speed control':'1 speed','Blade':'Stainless steel','Warranty':'1 year on motor'})
for n, w in [('Cruze',180),('Xtrail',250),('Nexon',350)]:
    add(name=f'{n} Hand Blender', brand='Pride', cat='blenders-choppers',
        desc=f'Pride {n} hand blender with a {w} W motor, slim and easy-grip handle and 2-speed control. 1 year warranty on the motor.',
        features=[f'{w} W motor','Slim and easy grip handle','2-speed control','Stainless steel blade','1 year warranty on motor'],
        specs={'Power':f'{w} W','Speed control':'2 speed','Blade':'Stainless steel','Warranty':'1 year on motor'})
add(name='Blendmix Hand Blender with Chopper', brand='Pride', cat='blenders-choppers',
    desc='Pride Blendmix hand blender with a 350 W motor and chopper attachment. 1 year warranty on the motor.',
    features=['350 W motor','Chopper attachment','2-speed control','Stainless steel blade','1 year warranty on motor'],
    specs={'Power':'350 W','Speed control':'2 speed','Blade':'Stainless steel','Attachment':'Chopper','Warranty':'1 year on motor'})
add(name='Electric Chopper', brand='Pride', cat='blenders-choppers',
    desc='Pride electric chopper with a 250 W motor and one-button easy start. 1 year warranty on the motor.',
    features=['250 W motor','1 button easy start','1-speed control','Stainless steel blade','1 year warranty on motor'],
    specs={'Power':'250 W','Speed control':'1 speed','Blade':'Stainless steel','Warranty':'1 year on motor'})
add(name='Madhani Hand Blender', brand='Pride', cat='blenders-choppers',
    desc='Pride Madhani with a heavy cast iron body, 2-way curd percolator, noiseless operation and low power consumption. 125/160 W motor with 1 year warranty on the motor.',
    features=['125/160 W motor','Heavy cast iron body','2-way curd percolator','Noiseless operation','Low power consumption','1 year warranty on motor'],
    specs={'Power':'125/160 W','Body':'Heavy cast iron','Warranty':'1 year on motor'})

add(name='Hand Press Juicer (Juice Machine)', brand='Pride', cat='juicers',
    desc='Pride hand press juice machine with an aluminium casting body, easy-to-operate handle, easy-grip side handle and removable cap for easy cleaning. Best used for sweet lime, malta, orange and pomegranate.',
    features=['Aluminium casting body','Easy-to-operate handle','Easy-grip side handle','Removable cap for easy cleaning','Best for sweet lime, malta, orange and pomegranate'],
    specs={'Body':'Aluminium casting'})
add(name='Juicy Juice Machine', brand='Pride', cat='juicers',
    desc='Pride Juicy juice machine with a 550 W motor, 3-speed control, stainless steel blade and washable accessories. 2 years warranty on the motor.',
    features=['550 W motor','3-speed control','Stainless steel blade','Washable accessories for easy cleaning','2 years warranty on motor'],
    specs={'Power':'550 W','Speed control':'3 speed','Blade':'Stainless steel','Warranty':'2 years on motor'})
add(name='Juice Mixer Grinder (Juice Machine)', brand='Pride', cat='juicers',
    desc='Pride juice machine with mixer grinder function, 550 W motor, 1 polycarbonate jar and 1 stainless steel jar. 5 years warranty on the motor.',
    features=['550 W motor','1 polycarbonate jar','1 stainless steel jar','3-speed control','Stainless steel blade','5 years warranty on motor'],
    specs={'Power':'550 W','Jars':'1 polycarbonate + 1 stainless steel','Speed control':'3 speed','Blade':'Stainless steel','Warranty':'5 years on motor'})

for n, w in [('Super Light',750),('Magic',1000),('Plancha',750)]:
    add(name=f'{n} Electric Iron (Press)', brand='Pride', cat='irons',
        desc=f'Pride {n} dry iron with {w} W power, non-stick sole plate, energy saving and adjustable control knob. 1 year warranty on product.',
        features=[f'{w} W high power','Non-stick sole plate','Energy saving','Adjustable control knob','1 year warranty on product'],
        specs={'Power':f'{w} W','Sole plate':'Non-stick','Warranty':'1 year on product'})

for n in ['Hurrican','Vortex']:
    add(name=f'{n} Air Cooler', brand='Pride', cat='coolers-fans',
        desc=f'Pride {n} air cooler with 150 W motor, 2-way swing modes, 3-speed control, sturdy vibration-free base and light, easy-to-carry body. 1 year warranty on the motor.',
        features=['150 W motor','2-way swing modes','3-speed control','Sturdy base, vibration free','Light weight and easy to move','1 year warranty on motor'],
        specs={'Power':'150 W','Swing':'2 ways','Speed control':'3 speed','Warranty':'1 year on motor'})

for n, b in [('Jointless Double Burner',2),('Jointless Three Burner',3),('Royal Double Burner',2),('Trio Three Burner',3)]:
    add(name=f'{n} LPG Gas Stove', brand='Pride', cat='gas-stoves-cooktops',
        desc=f'Pride {n.lower()} LPG gas stove in 100% stainless steel with brass burners for fuel efficiency and ergonomic knobs for a firm grip. 1 year warranty on product.',
        features=['100% stainless steel','Brass burners, fuel efficient','Ergonomic knobs for firm grip','Light weight and easy to move','1 year warranty on product'],
        specs={'Burners':str(b),'Body':'100% stainless steel','Burner material':'Brass','Warranty':'1 year on product'})
add(name='Ignis Infrared Cooktop', brand='Pride', cat='gas-stoves-cooktops',
    desc='Pride Ignis infrared cooktop with 2200 W high power, one-touch feather control, BBQ grill support and easy set-up. 1 year warranty on product.',
    features=['2200 W high power','One-touch feather control','BBQ grill, easy to set up','Light weight and easy to move','1 year warranty on product'],
    specs={'Power':'2200 W','Type':'Infrared','Warranty':'1 year on product'})

add(name='Electric Kettle', brand='Pride', cat='electric-kettles',
    desc='Pride stainless steel electric kettle in 1.5 L (SLM-1500) and 1.8 L (SLM-1800) capacities, with overheat protection, automatic switch off and 360° swivel base for cord-free serving. 1 year warranty on product.',
    features=['Stainless steel body','Overheat protection','Automatic switch off','360° swivel base, cord-free serving','1 year warranty on product'],
    specs={'Body':'Stainless steel','Models':'SLM-1500, SLM-1800','Warranty':'1 year on product'},
    options_label='Capacity', options=['1.5 L (SLM-1500)','1.8 L (SLM-1800)'])

for n in ['Radiant','Marigold','Magnum','Blossom','Legend']:
    add(name=f'{n} Insulated Casserole', brand='Pride', cat='casseroles',
        desc=f'Pride {n} insulated casserole with special PU insulation and a twisted lock mechanism. Freezer safe, with a food-grade stainless steel inner, BPA free and made of 100% virgin plastic.',
        features=['Special PU insulation','Twisted lock mechanism','Freezer safe','Food-grade stainless steel inner','BPA free, 100% virgin plastic'],
        specs={'Insulation':'Special PU','Inner':'Food-grade stainless steel','Plastic':'100% virgin, BPA free'})

# --------------------------------------------------------- RAJAT (Annapurna Industries)
LIFE = 'Lifetime warranty per manufacturer catalogue'
def rajat(code, name, cat, gauge=None, cb=False, options=None, size_info=None, lifetime=False, handle=None, featured=False, opt_label='Size'):
    full = name
    specs = {'Brand':'Rajat by Rajlaxmi','Material':'Stainless steel'}
    feats = ['Stainless steel']
    if gauge: specs['Gauge'] = gauge; feats.append(f'{gauge} gauge')
    if cb: specs['Base'] = 'Copper bottom'; feats.append('Copper bottom')
    if handle: specs['Handle'] = handle; feats.append(f'{handle} handle')
    if lifetime: feats.append(LIFE)
    desc = f'Rajat by Rajlaxmi {name}' + (f' in {gauge} stainless steel' if gauge else ' in stainless steel') + '.'
    if cb: desc += ' Copper bottom.'
    if size_info: desc += f' Sizes as per catalogue: {size_info}.'
    add(name=full, brand='Rajat', cat=cat, sku=code, desc=desc, features=feats, specs=specs,
        options=options or [], size_info=size_info, options_label=opt_label, featured=featured)

inch = lambda *n: [f'{x}"' for x in n]
# 20 swg cookware
rajat('AP-901','Plain Flat Bottom Kadai (20 SWG)','kadai','20 SWG',options=inch(10,11,12,13,14,15),lifetime=True)
rajat('AP-902','Plain Kadai (20 SWG)','kadai','20 SWG',options=inch(18,20),lifetime=True)
rajat('AP-903','Copper Bottom Flat Bottom Kadai (20 SWG)','kadai','20 SWG',cb=True,options=inch(12,13,14,15),lifetime=True,featured=True)
rajat('AP-904','Copper Bottom Kadai (20 SWG)','kadai','20 SWG',cb=True,options=inch(18,20),lifetime=True)
rajat('AP-905','Plain Saucepan (20 SWG)','saucepans','20 SWG',size_info='7 x 9 & 10 x 13',lifetime=True)
rajat('AP-906','Copper Bottom Saucepan (20 SWG)','saucepans','20 SWG',cb=True,size_info='7 x 9 & 10 x 13',lifetime=True)
rajat('AP-907','Plain Round Bottom Tope (20 SWG)','topes','20 SWG',size_info='7 x 9 & 10 x 18')
rajat('AP-908','Plain Flat Bottom Tope (20 SWG)','topes','20 SWG',size_info='7 x 9 & 10 x 18')
rajat('AP-909','Copper Bottom Round Tope (20 SWG)','topes','20 SWG',cb=True,size_info='7 x 9 & 10 x 18',lifetime=True)
rajat('AP-910','Copper Bottom Flat Tope (20 SWG)','topes','20 SWG',cb=True,size_info='7 x 9 & 10 x 18',lifetime=True)
# flatware
rajat('AP-911','Khumcha (20 SWG)','flatware','20 SWG',options=inch(10,11,12,13,14,15,16,18,20,22),lifetime=True)
rajat('AP-912','Patti Khumcha (20 SWG)','flatware','20 SWG',options=inch(14,15,16),lifetime=True)
rajat('AP-913','Tat (20 SWG)','flatware','20 SWG',options=inch(14,15))
rajat('AP-914','Beading Tat (20 SWG)','flatware','20 SWG',options=inch(16,18,20,22))
rajat('AP-915','Rajat Pizza Plate (22 SWG)','flatware','22 SWG',options=inch(9,11,13,15))
rajat('AP-916','Parat (20 SWG)','flatware','20 SWG',options=inch(16,18,20,22,24))
rajat('AP-917','Begi China (26 SWG)','flatware','26 SWG',options=inch(8,9,10,11,12,13))
rajat('AP-918','Mukta Vati (22 SWG)','flatware','22 SWG',options=inch(5,5.5,6,6.5,7,8))
rajat('AP-919','Prabhuchetty / Woorli Cover (22 SWG)','lids-covers','22 SWG',size_info='0 x 6')
rajat('AP-920','Saucepan Cover (22 SWG)','lids-covers','22 SWG',size_info='10 x 13')
# 22 swg cookware
rajat('AP-921','Tasla (22 SWG)','kadai','22 SWG',options=inch(9,10,11,12,13,14,15,16,18))
rajat('AP-922','Plain Kadai (22 SWG)','kadai','22 SWG',options=inch(9,10,11,12,13,14,15,16),featured=True)
rajat('AP-923','Plain Kadai Flat Bottom (22 SWG)','kadai','22 SWG',options=inch(10,11,12,13,14,15))
rajat('AP-924','Plain Saucepan, Wire Handle (22 SWG)','saucepans','22 SWG',size_info='9 x 13',handle='Wire')
rajat('AP-925','Plain Saucepan, Colour Wire Handle (22 SWG)','saucepans','22 SWG',size_info='9 x 13',handle='Colour wire')
rajat('AP-926','Plain Saucepan Belly, Wire Handle (22 SWG)','saucepans','22 SWG',size_info='10 x 13',handle='Wire')
rajat('AP-927','Plain Patti Saucepan, Wire Handle (22 SWG)','saucepans','22 SWG',size_info='9 x 15',handle='Wire')
rajat('AP-928','Plain Saucepan, Steel Handle (22 SWG)','saucepans','22 SWG',size_info='9 x 13',handle='Steel')
rajat('AP-929','Plain Saucepan Belly, Steel Handle (22 SWG)','saucepans','22 SWG',size_info='10 x 13',handle='Steel')
rajat('AP-930','Plain Patti Saucepan, Colour Wire Handle (22 SWG)','saucepans','22 SWG',size_info='9 x 15',handle='Colour wire')
rajat('AP-931','Rajat Life Time Round Bottom Tope (22 SWG)','topes','22 SWG',size_info='7 x 9, 10 x 18, 19 x 24, 25 x 28, 29 x 32',lifetime=True)
rajat('AP-932','Rajat Life Time Flat Bottom Tope (22 SWG)','topes','22 SWG',size_info='7 x 9, 10 x 18, 19 x 24',lifetime=True)
rajat('AP-935','Plain Prabhuchetty (22 SWG)','topes','22 SWG',size_info='0 x 6')
rajat('AP-936','Plain Vena Chetty (22 SWG)','topes','22 SWG',size_info='0 x 5')
rajat('AP-937','Plain Woorli (22 SWG)','topes','22 SWG',size_info='0 x 5, 6 x 9')
rajat('AP-938','Plain Vegapot with Cover (22 SWG)','topes','22 SWG',size_info='1 x 4')
rajat('AP-939','Europot with Cover (22 SWG)','topes','22 SWG',size_info='1 x 4')
rajat('AP-940','Plain Frypan (22 SWG)','frypans','22 SWG',size_info='10 x 12')
# 22 swg copper bottom
rajat('AP-941','Copper Bottom Tasla (22 SWG)','kadai','22 SWG',cb=True,options=inch(9,10,11,12,13,14,15,16,18))
rajat('AP-942','Copper Bottom Kadai (22 SWG)','kadai','22 SWG',cb=True,options=inch(8,9,10,11,12,13,14,15,16,18),featured=True)
rajat('AP-943','Copper Bottom Kadai Flat Bottom (22 SWG)','kadai','22 SWG',cb=True,options=inch(10,11,12,13,14,15))
rajat('AP-946','Copper Bottom Saucepan Belly, Colour Wire Handle (22 SWG)','saucepans','22 SWG',cb=True,size_info='9 x 13',handle='Colour wire')
rajat('AP-947','Copper Bottom Saucepan Belly, Wire Handle (22 SWG)','saucepans','22 SWG',cb=True,size_info='9 x 13',handle='Wire')
rajat('AP-948','Copper Bottom Saucepan, Steel Handle (22 SWG)','saucepans','22 SWG',cb=True,size_info='9 x 13',handle='Steel')
rajat('AP-949','Copper Bottom Saucepan Belly, Steel Handle (22 SWG)','saucepans','22 SWG',cb=True,size_info='9 x 13',handle='Steel')
rajat('AP-950','Copper Bottom Saucepan, Wire Handle (22 SWG)','saucepans','22 SWG',cb=True,size_info='9 x 13',handle='Wire')
rajat('AP-951','Copper Bottom Saucepan, Colour Wire Handle (22 SWG)','saucepans','22 SWG',cb=True,size_info='9 x 13',handle='Colour wire')
rajat('AP-952','Copper Bottom Patti Saucepan, Colour Wire Handle (22 SWG)','saucepans','22 SWG',cb=True,size_info='9 x 13, 14 x 15',handle='Colour wire')
rajat('AP-953','Copper Bottom Round Bottom Tope (22 SWG)','topes','22 SWG',cb=True,size_info='7 x 9, 10 x 18')
rajat('AP-954','Copper Bottom Round Bottom Tope, Large (22 SWG)','topes','22 SWG',cb=True,size_info='19 x 24, 25 x 28')
rajat('AP-955','Copper Bottom Flat Bottom Tope (22 SWG)','topes','22 SWG',cb=True,size_info='7 x 9, 10 x 18')
rajat('AP-956','Copper Bottom Flat Bottom Tope, Large (22 SWG)','topes','22 SWG',cb=True,size_info='19 x 24')
rajat('AP-957','Copper Bottom Prabhuchetty (22 SWG)','topes','22 SWG',cb=True,size_info='0 x 6')
rajat('AP-958','Copper Bottom Woorli (22 SWG)','topes','22 SWG',cb=True,size_info='0 x 5, 6 x 9')
rajat('AP-959','Copper Bottom Prabhuchetty, Pipe Handle (22 SWG)','topes','22 SWG',cb=True,size_info='1 x 3')
rajat('AP-960','Copper Bottom Vegapot with Cover (22 SWG)','topes','22 SWG',cb=True,size_info='1 x 4')
rajat('AP-961','Copper Bottom Euro Pot with Cover (22 SWG)','topes','22 SWG',cb=True,size_info='1 x 4')
rajat('AP-962','Copper Bottom Vena Chetty (22 SWG)','topes','22 SWG',cb=True,size_info='0 x 5')
rajat('AP-963','Copper Bottom Frypan (22 SWG)','frypans','22 SWG',cb=True,size_info='10 x 12')
# tiffins
rajat('AP-960','Kadi Tiffin, 4 Tier','tiffins',size_info='7 x 4, 8 x 4, 9 x 4',featured=True)
rajat('AP-961','Kadi Tiffin, 3 Tier','tiffins',size_info='7 x 3, 8 x 3, 9 x 3')
rajat('AP-962','Kadi Tiffin, 2 Tier','tiffins',size_info='7 x 2, 8 x 2, 9 x 2')
rajat('AP-963','Kadi Tiffin, 10 x 3','tiffins',size_info='10 x 3')
rajat('AP-964','Kadi Tiffin, 10 x 4','tiffins',size_info='10 x 4')
rajat('AP-965','Kadi Tiffin, 10 x 5','tiffins',size_info='10 x 5')
rajat('AP-966','Food Carrier','tiffins',size_info='7 x 2, 7 x 3, 7 x 4, 8 x 2, 8 x 3, 8 x 4, 9 x 2, 9 x 3, 9 x 4, 10 x 2, 10 x 3, 10 x 4')
# storageware
rajat('AP-967','Papad Dibba','storageware',options=['Small','Big'])
rajat('AP-968','Puri Dibba','storageware',size_info='7 x 9, 10 x 13')
rajat('AP-969','Masala Dibba','storageware',options=inch(12,13))
rajat('AP-970','Basin (24 SWG)','storageware','24 SWG',options=inch(13,14,15,16,17,18,19,20,22))
rajat('AP-971','Basin (22 SWG)','storageware','22 SWG',options=inch(13,14,15,16,17,18,19,20,22,24))
rajat('AP-972','Tasla (26 SWG)','storageware','26 SWG',options=inch(10,11,12,13,14,15,16,18))
# box packing sets
for code, nm, sz in [('AP-973','Copper Bottom Prabhuchetty Pipe Handle Set','1 x 3'),('AP-974','Copper Bottom Europot Set','1 x 3'),
                     ('AP-975','Copper Bottom German Pot Set','1 x 3'),('AP-976','Copper Bottom Vega Pot Set','1 x 3'),
                     ('AP-977','Copper Bottom Italian Pot Set','1 x 3'),('AP-978','Copper Bottom Indigo Pot Set','1 x 6'),
                     ('AP-979','Copper Bottom Icon Pot Set','1 x 3')]:
    rajat(code, nm, 'cookware-sets', cb=True, size_info=sz, featured=(code in ('AP-976','AP-977')))

# Featured picks among Pride items
feat_names = {'Comet Mixer Grinder','Rover Mixer Grinder','Thunder Mixer Grinder','Nutri Mix Nutri Blender',
              'Jointless Three Burner LPG Gas Stove','Electric Kettle','Super Light Electric Iron (Press)','Hurrican Air Cooler'}

# ---------------------------------------------------------------- write SQL
out = ["-- Generated by scripts/make_seed.py from the PRIDE and RAJAT catalogues.",
       "-- Prices are intentionally NULL: set them in Admin > Products.",
       "-- Safe to re-run: existing rows (same slug / category slug) are left untouched.", ""]
for i, (slug, name, desc) in enumerate(cats):
    out.append(f"insert into public.categories (slug, name, description, sort_order) values ({q(slug)}, {q(name)}, {q(desc)}, {i}) on conflict (slug) do nothing;")
out.append("")
seen = {}
for p in products:
    base = slugify(p['name'] + ('-' + p['sku'].lower() if p.get('sku') and p['brand']=='Rajat' else ''))
    if p['brand'] == 'Pride': base = slugify('pride-' + p['name'])
    else: base = slugify(p['sku'] + '-' + p['name'])
    n = seen.get(base, 0); seen[base] = n + 1
    slug = base if n == 0 else f'{base}-{n+1}'
    feat = p.get('featured') or p['name'] in feat_names
    out.append(
      "insert into public.products (slug, sku, name, brand, category_id, description, features, specs, options_label, options, size_info, is_featured) values ("
      f"{q(slug)}, {q(p.get('sku'))}, {q(p['name'])}, {q(p['brand'])}, (select id from public.categories where slug={q(p['cat'])}), "
      f"{q(p['desc'])}, {arr(p['features'])}, {q(json.dumps(p['specs']))}::jsonb, {q(p.get('options_label','Size'))}, {arr(p.get('options',[]))}, {q(p.get('size_info'))}, {'true' if feat else 'false'}) "
      "on conflict (slug) do nothing;")
open('supabase/seed.sql','w').write("\n".join(out) + "\n")
print(len(cats),'categories',len(products),'products')
