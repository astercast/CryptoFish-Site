// ================================================
// CryptoFish  -  globe.js  v3  (globe.gl)
// ================================================

let globeInitialized = false;
let globeInstance    = null;
let locDataArr       = [];
// ── Locality → [lat, lon] ─────────────────────────
const LOC_COORDS = {
  // Lake Malawi
  'Nkhata Bay':[-11.6,34.3],'Likoma Island':[-12.1,34.7],'Chizumulu Island':[-11.8,34.5],
  'Mbenji Island':[-13.6,34.7],'Namalenje Island':[-13.4,34.7],'Thumbi West Island':[-14.1,34.8],
  'Thumbi East Island':[-14.1,34.9],'Boadzulu Island':[-14.2,35.0],'Otter Point':[-14.0,34.9],
  'Cobwe':[-12.3,34.4],'Ndumbi Rocks':[-12.0,34.4],'Makanjila Point':[-14.4,35.2],
  'Mara Rocks':[-12.5,34.5],'Hai Reef':[-13.9,34.8],'Taiwanee Reef':[-14.2,34.9],
  'Maingano Island':[-12.2,34.3],'Chembe Beach':[-14.0,34.8],'Gome Rock':[-11.5,34.3],
  'Gome':[-11.5,34.3],'Manda':[-10.7,34.2],'Masinje':[-14.3,35.0],'Senga Point':[-13.8,34.8],
  'Ngwasi':[-13.0,34.6],'Chinyankwazi Island':[-13.7,34.7],'Liwani':[-14.5,35.3],
  'Gallireya Reef':[-12.8,34.6],'Higga Reef':[-11.5,34.3],'Undu Reef':[-11.8,34.4],
  'Nakantenga Island':[-13.3,34.6],'Mphanga Rocks':[-11.4,34.2],'Chidunga Rocks':[-13.7,34.8],
  'Metangula':[-12.3,34.8],'Ntekete':[-14.3,35.1],'Mdowa':[-11.2,34.2],'Itungi':[-9.4,34.0],
  'Ruarwe':[-11.0,34.2],'Londo':[-10.4,34.2],'Londo Bay':[-10.4,34.2],'Cape Kaiser':[-11.2,34.1],
  'Mbweca Rocks':[-11.4,34.2],'Chiofu':[-11.5,34.3],'Maleri Island':[-13.8,34.8],
  'Mbamba Bay':[-11.4,34.5],'Dwanga':[-13.2,34.5],'Meponda':[-13.8,35.4],
  // Lake Tanganyika
  'Kigoma':[-4.9,29.6],'Kipili':[-7.4,30.6],'Kekese':[-6.2,30.2],'Isanga':[-8.6,31.0],
  'Cape Kabogo':[-5.9,29.8],'Kantalamba':[-8.5,31.1],'Mabilibili':[-6.8,30.4],'Halembe':[-4.6,29.6],
  'Mvuna Island':[-7.3,30.6],'Kalala Island':[-7.2,30.5],'Ubwari':[-4.3,29.3],
  'Ulwile Island':[-7.0,30.5],'Fulwe Rocks':[-6.5,30.3],'Kalambo Lodge':[-8.6,31.2],
  'Mboko Island':[-4.8,29.5],'Msalaba':[-5.2,29.7],'Cape Mpimbwe':[-7.4,30.5],
  'Udachi':[-4.4,29.5],'Wimbi':[-4.3,29.4],'Mtoto':[-6.9,30.4],'Bemba':[-4.7,29.5],
  'Ikola':[-6.8,30.4],'Luagala Point':[-5.8,29.8],'Katumbi Point':[-5.5,29.8],
  'Pasagulu Point':[-8.8,31.3],'Katonga':[-4.5,29.5],'Kizike':[-4.8,29.5],
  'Chituta Bay':[-8.6,31.1],'Chimba':[-5.4,29.7],'Lumbye Bay':[-8.4,31.0],
  'Cape Nambeyeye':[-8.0,30.8],'Isonga':[-4.6,29.5],'Mahale National Park':[-6.1,29.9],
  'Kaswente Bay':[-8.7,31.2],'Mwaka':[-7.1,30.5],'Shanshete':[-7.2,30.5],
  'Kansombo':[-7.3,30.6],'Kabwe':[-7.2,30.6],'Kasongola':[-4.8,29.6],'Kalugunga':[-5.0,29.7],
  'Kushangaza':[-5.9,29.9],'Cape Caramba':[-5.6,29.8],'Cape Nundo':[-5.7,29.8],
  'Chibwensolo':[-8.5,31.0],'Kifumbwe':[-6.5,30.3],'Minago':[-5.0,29.6],'Mucansi':[-5.2,29.7],
  'Gitaza':[-3.5,29.4],'Nyanza-Lac':[-4.3,29.4],'Uvira':[-3.4,29.1],'Tembwe Deux':[-4.2,29.3],
  'Bulu Point':[-5.1,29.7],'Kyeso':[-5.8,29.8],'Katenga':[-5.4,29.7],'Mawimbi':[-4.8,29.5],
  'Nkwasi Point':[-5.2,29.7],'Moliro':[-8.9,31.4],'Livua':[-8.0,30.8],'Kiku':[-8.3,31.0],
  'Kapampa':[-8.6,31.1],'Mkuyu':[-5.6,29.8],'Kilima':[-5.3,29.7],'Segunga (North)':[-5.2,29.7],
  'Kungwe Point':[-6.0,29.9],'Ifala':[-8.1,30.9],'Ndole Bay':[-8.4,31.0],'Lupota':[-8.5,31.1],
  'Kashekzi':[-5.6,29.8],'Kasalamnjaga':[-4.7,29.6],
  // Lake Victoria
  'Makobe Island':[-1.1,33.6],'Kisumu':[-0.1,34.8],'Napoleon Gulf':[0.4,33.2],
  'Mwanza Gulf':[-2.5,32.9],'Rusinga Island':[-0.4,34.2],'Lake Ukerewe':[-2.0,33.1],
  'Napoleon Gulf':[0.4,33.2],'Lake George':[-0.1,30.2],
  // Other African lakes
  'Lake Barombi Mbo':[4.7,9.3],'Lake Ejagham':[5.5,8.9],'Lake Bosumtwi':[-6.5,-1.4],
  'Mangarahara River':[-18.8,46.8],'Andapa':[-14.7,49.6],
  // Red Sea / Indian Ocean
  'Hurghada':[27.2,33.8],'Jeddah':[21.5,39.2],'Gulf of Aqaba':[28.5,34.9],
  'Siyul El Gelwa':[27.5,33.9],'Fury Shoals':[24.5,35.2],'Massawa':[15.6,39.5],
  'Fahl Island':[23.6,58.5],'Persian Gulf':[26.0,52.0],'Gulf of Oman':[22.0,57.0],
  'Mirbat':[16.9,54.7],'Unawatuna':[6.0,80.2],'Maldives':[4.2,73.5],'Ellaidhoo':[4.1,73.2],
  'Vilamendhoo':[3.6,72.9],'Baa Atoll':[5.0,72.8],'Ras Nasrani':[28.0,34.4],
  // Southeast Asia / Coral Triangle
  'Raja Ampat':[-0.5,130.7],'Komodo':[-8.5,119.5],'Lembeh Strait':[1.4,125.2],
  'Cebu':[10.3,123.9],'Anilao':[13.7,120.9],'El Nido':[11.2,119.4],'Bintan':[1.1,104.5],
  'Sulawesi':[-1.5,120.5],'Phuket':[8.0,98.3],'Coron':[11.9,120.2],'Bali':[-8.3,115.2],
  'Flores':[-8.7,121.5],'Panabo':[7.3,125.7],'North Sulawesi':[1.5,125.0],
  'Okinawa':[26.5,128.0],'Sesoko Island':[26.6,127.9],'Tulumben':[-8.3,115.6],
  'Mergui Island':[12.0,98.0],'Ambon Bay':[-3.7,128.2],'Palau':[7.5,134.5],
  // Pacific
  'Moorea':[-17.5,-149.8],'Tahiti':[-17.7,-149.5],'Nacula Island':[-16.9,177.4],
  'Wakaya':[-17.6,179.0],'Enewetak':[11.5,162.3],'Kwajalein':[8.7,167.7],
  'Dumaguete':[9.3,123.3],'Mabini':[13.7,121.1],'Minabe':[33.8,135.4],'Kasumi':[35.6,134.6],
  'Busan':[35.1,129.0],'Wongat Island':[-5.5,145.8],'Lord Howe Island':[-31.5,159.1],
  'Mooloolaba':[-26.7,153.1],'Middleton Reef':[-29.5,159.1],'Ribbon Reefs':[-15.0,145.0],
  'Raine Island':[-11.6,144.0],'Christmas Island':[-10.5,105.7],'Cook Islands':[-21.2,-159.8],
  'Big Island':[19.6,-155.5],'Kona':[19.6,-156.0],'Rabbit Island':[21.4,-157.7],
  'Jade Shoals':[21.0,-157.5],'Polo Beach':[20.7,-156.4],'North Bali':[-8.1,115.1],
  'Mihiri':[5.1,73.0],'Helengeli':[4.5,73.6],'Nusa Dua':[-8.8,115.2],
  // Caribbean / Atlantic
  'Bonaire':[12.2,-68.3],'Curacao':[12.3,-69.0],'La Romana':[18.4,-69.0],
  'Navassa Island':[18.4,-75.0],'Lighthouse Reef Atoll':[17.3,-87.5],'Guarapari':[-20.7,-40.5],
  'Ascension Island':[-7.9,-14.3],'Cape Verde':[16.0,-24.0],'Gulf of California':[26.0,-110.0],
  'Gulf Of Mexico':[25.0,-90.0],'Baffin Bay':[73.0,-68.0],
  // Africa continued
  'Watamu':[-3.4,40.0],'Aliwal Shoal':[-30.3,30.9],'Sodwana Bay':[-27.5,32.7],
  'Mafia Island':[-7.9,39.7],'Chumbe Island':[-6.3,39.2],'Zanzibar':[-6.2,39.2],
  // East Africa / rivers
  'Meme River':[5.0,9.5],'Aguaytia River':[-9.2,-75.5],'Rio Tapajos':[-5.0,-57.0],
  'Rio Xingu':[-3.5,-52.0],'Rio Xingu Basin':[-3.5,-52.0],'Rio Araguaia':[-13.0,-50.0],
  'Rio Negro':[-3.0,-61.0],'Orinoco River':[7.0,-65.0],'Upper Orinoco River':[4.0,-67.0],
  'Ventuari River':[4.0,-65.5],'Parana River':[-25.0,-57.0],'Suriname':[4.0,-56.0],
  'Essequibo River':[5.0,-59.0],'Atins':[-2.5,-43.0],'Ubatuba':[-23.4,-45.1],
  'Meta':[4.0,-73.0],'Atabapo River':[4.0,-67.2],'Xingu River basin':[-3.5,-52.0],
  // SE Asia rivers
  'Irrawaddy':[17.0,96.0],'Myanmar':[19.0,96.5],'Mekong River':[12.0,105.0],
  'Salween River':[17.0,97.5],'Muang Khong':[14.0,105.8],'Malay Peninsula':[4.5,103.0],
  'Kalimantan Barat':[0.0,111.0],'Kalimantan Timur':[0.5,117.0],'Java':[-7.5,110.5],
  'Sumatra':[-0.5,101.5],'Sarawak':[3.0,113.0],'Mahakam Basin':[0.0,116.5],
  'Mempawah':[-0.5,109.0],'Riau Islands':[1.0,104.0],'Selangor':[3.4,101.4],
  // South Asia
  'Kerala':[10.0,76.5],'Kumaradhara River':[12.7,75.2],'Madhya Pradesh':[23.5,78.0],
  'Sri Lanka':[7.5,80.7],'Bihn Duong':[10.9,106.8],
  // Australia / NZ
  'Monterey Bay':[36.8,-121.9],'Des Moines':[41.6,-93.6],'Virginia':[37.4,-79.0],
  'Arkansas River Drainage':[36.0,-95.0],'Ogeechee River':[33.0,-81.9],
  'English River':[50.0,-93.7],'St. Lawrence River':[46.0,-74.0],'Great Lakes':[44.0,-78.0],
  // Special / worldwide
  'Worldwide':[20.0,0.0],'Atlantic Ocean':[0.0,-30.0],'North Atlantic Ocean':[45.0,-30.0],
  'North Pacific Ocean':[40.0,-160.0],'Pacific Ocean':[0.0,-140.0],
  'Godthaab':[64.2,-51.7],'Galician continental shelf':[43.0,-10.0],
  'Yangtze River':[30.0,110.0],'Tisza River':[48.0,20.0],'Krka':[43.9,16.1],
  'Hormuzgan':[27.0,56.5],'Isla de la Juventud':[21.6,-82.8],'Lake Xochimilco':[19.3,-99.1],
  'Lake Apoyo':[11.9,-86.0],'Lake Amatitlan':[14.5,-90.5],'Catemaco Lake':[18.4,-95.1],
  'Media Luna':[21.9,-99.2],'Rio Chalchijapan':[17.8,-92.9],'Rio Salado':[17.5,-92.5],
  'Rio Canaveral':[10.9,-75.0],'Rio Meta':[4.5,-72.3],'Andes River':[-8.0,-78.0],
  'Altamira':[-3.2,-52.2],'Tapajos Basin':[-4.0,-55.0],'Tocantins':[-10.0,-48.5],
  'Rio Pindar':[-5.0,-45.0],'Bahia River Basin':[-12.5,-41.5],
  'Cuduyari':[1.0,-69.0],'Pamoni River':[5.5,-61.0],'Maroni River Basin':[4.5,-54.0],
  'Andes River':[-8.0,-78.0],'Suksamrarn':[16.4,103.0],'Florida Island':[-9.1,160.2],
  'Pavuvu Island':[-9.0,159.1],'Solomon Islands':[-9.0,160.0],
  'Napo River Drainage':[-1.5,-77.5],'Salween River':[17.0,97.5],
  'Hormuzgan':[27.0,56.5],'Malagarasi River':[-5.5,30.5],'Lake Peten-Itza':[16.9,-89.9],
  'Lago Peten':[16.9,-89.9],'Chacamax River':[17.5,-92.0],'San Juan River Basin':[10.8,-84.0],
  'San Jose River':[10.0,-84.5],'Olla 5 River':[9.3,-83.5],'Rio Tefe':[-3.4,-64.7],
  'Rio Ucayali':[-8.0,-74.0],'Rio Babahoyo':[-1.8,-79.5],'Cumar':[2.5,-66.5],
  'Arara cachoeiras':[-6.0,-53.0],'Rio Pindare':[-5.0,-45.0],'Vitoria do Xingu':[-3.2,-52.0],
  'Guaviare':[2.5,-72.5],'Suriname':[4.0,-56.0],'Essequibo River':[5.0,-59.0],
  'Parana River':[-25.0,-57.0],'Guanabara Bay Basin':[-22.9,-43.2],
  'Lower Tocantins River Basin':[-5.5,-49.0],'Sao Simao':[-18.9,-50.5],
  'Puente El Chilte':[23.6,-105.4],'Santo Domingo River':[15.5,-92.0],
  'Olla 5 River':[9.3,-83.5],'Kumradhara River':[12.7,75.2],
  // Misc
  'Chesterfield Islands':[-19.9,158.3],'Middleton Reef':[-29.5,159.1],
  'Rottnest Island':[-32.0,115.5],'Exmouth':[-21.9,114.1],'North Island':[-38.0,175.5],
  'Monkey Mia':[-25.8,113.7],'Moka Manu':[-17.5,-149.8],'Maitre Island':[-22.3,166.5],
  'Sodwana Bay':[-27.5,32.7],'Raine Island':[-11.6,144.0],'Cocos Islands':[-12.1,96.9],
  'Poivre Atoll':[-5.8,53.3],'Hikkaduwa':[6.1,80.1],'Watamu':[-3.4,40.0],
  'Umm Gamaar':[27.2,33.9],'Guitars Island':[12.0,-69.5],'Pulau Putri':[-5.7,106.5],
  'Siyul El Gelwa':[27.5,33.9],'Milne Bay':[-10.3,150.5],'Dampier':[-20.6,116.7],
  'Punta Carrion':[-0.4,-90.4],'Ascension Island':[-7.9,-14.3],
  'Saint Helena Island':[-15.9,-5.7],'Mwangaden River':[4.2,38.5],
  'Mudflats':[-35.0,138.0],'Mauritius':[-20.2,57.5],'Mauritania':[20.0,-12.0],
  'Burdwood Bank':[-54.5,-60.0],'Maale':[3.5,73.5],'Massawa':[15.6,39.5],
  'Selagor':[3.4,101.4],'Pangandaran':[-7.7,108.6],'Bunaken':[1.6,124.8],
  'Loang Spit':[1.6,124.9],'Maumere':[-8.6,122.2],'Apo Island':[9.1,123.4],
  'Davao':[7.0,125.6],'Hon Mun Island':[12.2,109.3],'Verde Island Passage':[13.5,121.0],
  'Boracay':[11.9,121.9],'Puerto Galera':[13.5,121.0],'Subic Bay':[14.8,120.2],
  'Balamban':[10.5,123.7],'Puerto Princesa':[9.8,118.7],'Bohol':[9.8,124.2],
  'Leyte Gulf':[11.0,125.5],'Camiguin Island':[9.2,124.7],'Surigao Strait':[10.2,125.4],
  // ══ Additional localities (auto-generated) ══
'Magunga':[-10.3,34.1],
  'Lake Bermin':[5.2,9.8],
  'Amazon Basin':[-3,-60],
  'Luwala Reef':[-11.6,34.4],
  'LionΓÇÖs Cove':[-10.8,34.2],
  'Chitande Island':[-12.1,34.6],
  'Chilumba':[-10.4,34.3],
  'Jalo Reef':[-11.3,34.3],
  'Reunion island':[-21.1,55.5],
  'Minos Reef':[-11,34.2],
  'Mazinzi Reef':[-14,34.8],
  'Mekong Basin':[15,106],
  'Tapajos River Basin':[-4.5,-56],
  'Katale Island':[-6.5,30.3],
  'Kasanga':[-8.6,31.2],
  'Bonito':[-21.1,-56.5],
  'Sumbu':[-8.7,31],
  'Nakatenga Island':[-13.3,34.7],
  'Mdoka':[-11.5,34.2],
  'Tocantins River':[-10.5,-49],
  'Curacao Island':[12.2,-69],
  'Vit├│ria do Xingu':[-3.3,-52],
  'Katete':[-8.5,31],
  'Eccles Reef':[-14.1,34.9],
  'Amazon River Basin':[-3,-60],
  'Makokola Reef':[-14.3,35.1],
  'Linganjala Reef':[-14.1,34.8],
  'Kambwimba':[-12.5,34.5],
  'Orinoco River Basin':[7.5,-64],
  'Pombo Rocks':[-11.3,34.3],
  'Makonde':[-13.5,34.7],
  'Luwino Reef':[-12,34.5],
  'Maison Reef':[-13.5,34.7],
  'Thumbi Point':[-14.1,34.8],
  'Chitimba Bay':[-10.6,34.2],
  'Mkangazi':[-13.7,34.8],
  'Cape Kachese':[-13,34.5],
  'Rio Tocantins':[-10.5,-49],
  'Liuli':[-11,34.5],
  'Mara Point':[-12.5,34.5],
  'Guiana Shield':[4,-58],
  'Ndonga':[-11.5,34.3],
  'Narungu':[-11,34.2],
  'Lyamembe':[-6.2,30.1],
  'R├¡o Meta':[4.5,-72.3],
  'Great Barrier Reef':[-16,145.8],
  'Zimbawe Rock':[-14,34.9],
  'St. Croix':[17.7,-64.8],
  'Hongi Island':[-14.1,34.9],
  'Lady Elliot Island':[-24.1,152.7],
  'Kakusa':[-10.5,34.2],
  'Border':[-4.3,29.3],
  'Chrisola K Wreck':[12.2,-68.3],
  'Chewere':[-13.8,34.8],
  'Chiloelo':[-14,34.9],
  'South East Arm':[-14.5,35.2],
  'Bocas del Toro':[9.3,-82.3],
  'Chinyamwezi Island':[-14,34.8],
  'Kirondo':[-4.5,29.4],
  'JakobsenΓÇÖs Beach':[-4.9,29.6],
  'Lake Nawampassa':[-14.2,35],
  'Namansi':[-13.5,34.7],
  'Same Bay':[-11,34.2],
  'Mirihi':[3.6,72.7],
  'Chiofu Bay':[-11.5,34.3],
  'Alor':[-8.3,124.7],
  'Araguaia River Basin':[-13,-50],
  'Machili Island':[-12,34.5],
  'Eniwetok':[11.5,162.3],
  'Lupote Rocks':[-12,34.5],
  'Kambiri':[-14,34.8],
  'Thistlegorm':[27.8,34],
  'Senga Bay':[-13.9,34.7],
  'Isanga Bay':[-13.5,34.7],
  'Amur River':[48.5,135],
  'Chiwindi':[-14,34.9],
  'Ganges River':[25.5,83],
  'Wampembe':[-6.5,30.3],
  'Johnston Island':[16.7,-169.5],
  'Majuro':[7.1,171.4],
  'Matema':[-9.5,34.1],
  'Chinyamwezi':[-14,34.8],
  'Nkanda':[-10.5,34.2],
  'Lushununu':[-13,34.5],
  'Hopong':[20.8,97.2],
  'Meta River':[4.5,-72.3],
  'Lundo Island':[-11.5,34.4],
  'Congo River Basin':[-4.3,15.3],
  'Para':[-1.5,-48.5],
  'Tai National Park ':[5.9,-7.4],
  'Lundu':[-11.5,34.3],
  'Unknown':[0,0],
  'Kolwe Point':[-12.5,34.5],
  'Nuarro':[-14.5,40.7],
  'Xingu River Basin':[-3.5,-52],
  'Chitimba Bay (Deep)':[-10.6,34.2],
  'Lac Tseny':[-16.6,45.9],
  'Ikombe':[-10.7,34.2],
  'Chirwa Island':[-11,34.3],
  'Masimbwe Island':[-14,34.8],
  'Bremer Bay':[-34.4,119.4],
  'Chilumba Bay':[-10.4,34.3],
  'Chimwalani Reef':[-13.5,34.7],
  'Madeira':[32.6,-16.9],
  'Miyako Point':[24.8,125.3],
  'Kapamba':[-11,34.2],
  'Muzi':[-13.5,34.7],
  'Ndomo Point':[-14,34.9],
  'Rio Guaramo':[10.5,-63.5],
  'Makankha Reef':[-13.8,34.8],
  'Kavala Island':[-14,34.9],
  'Kashia Island':[-12,34.5],
  'Mumbo Island':[-14,34.8],
  'Nkondwe Island':[-12.5,34.5],
  'Cape Nangu':[-13,34.6],
  'Rakhine Yoma':[19,94.5],
  'Ababi Island':[-11.5,34.4],
  'Rarotonga':[-21.2,-159.8],
  'Inle Lake':[20.5,96.9],
  'Cape Bangwe':[-13.5,34.7],
  'Wadi Gimal':[24.7,35.1],
  'Burundi':[-3.5,29.3],
  'River Rur':[50.8,6.4],
  'Menjangan Island':[-8.1,114.5],
  'Minas Gerais':[-19,-44],
  'Amu Darya River':[40,63],
  'Mediterranean Sea':[35,18],
  'Tsano Rock':[-12.5,34.5],
  'Rio Nanay':[-3.7,-73.3],
  'Magdalena Basin':[7.5,-74],
  'Myuku':[-12.5,34.5],
  'Nwanza Gulf':[-13.5,34.7],
  'Karilani Island':[-14,34.8],
  'Kiriza':[-4.5,29.5],
  'Segunga':[-12.2,34.5],
  'Buff Island':[-11.3,34.3],
  'Ndumbi Point':[-12,34.4],
  'Caspian Sea':[41,50],
  'Chilanga':[-14,35],
  'Mbamba Island':[-11.4,34.5],
  'Zambia':[-15,28.3],
  'Samazi':[-4.8,29.6],
  'Orinoco River Drainage':[7.5,-64],
  'Caroline Island':[10,150],
  'Volga River':[48.5,44.5],
  'Kawanga':[-11.5,34.3],
  'Kariliani':[-14,34.8],
  'Kosi River':[26.5,87],
  'Ngara':[-10.5,34.2],
  'Mtosi Bay':[-13.8,34.8],
  'Puulu':[-11,34.2],
  'Akumal':[20.4,-87.3],
  'Lake Superior':[47.5,-87.5],
  'Abu Omama':[24.3,35.3],
  'Zaire':[-4.3,15.3],
  'Sete Barras':[-24.4,-47.6],
  'Chitande':[-12.1,34.6],
  'Otter Island':[-14,34.8],
  'Baleh River':[2,113.5],
  'Rio Huallaga':[-7,-76],
  'Eriyadu':[4.7,73.6],
  'Guimaras Island':[10.6,122.6],
  'Gili Lawa Darat':[-8.5,119.6],
  'Lintah Straight':[-8.5,119.5],
  'Sumbawa':[-8.7,117.5],
  'Lake Barombi Koto':[4.5,9.3],
  'Jaldapara National Park':[26.7,89.3],
  'Indian Ocean':[-10,70],
  'Florida':[27,-82],
  'Onon River':[49,111],
  'Rio Paraguassu':[-12.6,-41],
  'Santa Catalina Island':[33.4,-118.4],
  'Mbita Point':[-0.4,34.2],
  'Port Hedland':[-20.3,118.6],
  'Lion Point':[-10.8,34.2],
  'Lower Fraser River':[49.2,-122.5],
  'Longola':[-10.5,34.2],
  'Tropic of Capricorn':[-23.5,0],
  'Widi Island':[0.5,127.8],
  'Tumbi Point':[-11.5,34.3],
  'Urup Island':[45.9,150],
  'Kerry':[52,-9.8],
  'Bulombora':[-10.8,34.2],
  'Caramba':[-10.3,34.1],
  'Karago':[-11,34.2],
  'Lake Yzabal':[15.5,-89.2],
  'Ixtapa':[17.7,-101.6],
  'Jojo Island':[-12,34.5],
  'Sixaola Drainage':[9.6,-82.6],
  'Wanlitung':[21.9,120.7],
  'Faror Island':[-7.5,30.6],
  'Paso Horqueta':[-22.3,-59.9],
  'Preto River':[-20.5,-49.5],
  'Cape Maclear':[-14,34.8],
  'Thinadhoo-Vaavu':[2,73.5],
  'Skeleton Bay':[-21.5,14],
  'Phi Phi Island':[7.7,98.8],
  'Sal Island':[16.7,-22.9],
  'Blue Earth Reef':[-13.5,34.7],
  'Funauki Bay':[24.3,123.7],
  'Chesterfield Bank':[-19.8,158.4],
  'North Sumatra':[2.5,99],
  'Nicobar Islands':[8,93.5],
  'Kadango':[-14.2,34.9],
  'Chidunga':[-13.7,34.8],
  'Kasai River':[-3.5,20.5],
  'Cape Barrow':[-14,136],
  'North Myanmar':[25,97],
  'Lower Negro River Basin':[-1,-63],
  'Nam Mae Taeng River':[19.2,98.9],
  'Djibouti':[11.5,43.1],
  'Menjangan':[-8.1,114.5],
  'Mauphelia Atoll':[-16.5,-154],
  'Barra do Rio Negro':[-3.1,-60],
  'Rio Mariana':[-20,-43],
  'Ricketts Point':[-38,145],
  'Cangrejos Yacht Club':[18.5,-66.1],
  'Bunjako':[0,32.3],
  'Altamira Lagoon':[-3.2,-52.2],
  'Paraguay River Basin':[-22,-58],
  'Discovery Bay':[18.5,-77.4],
  'Sandhills':[-14,34.8],
  'Honda Bay':[9.8,118.7],
  'Tchinga Reef':[-12,34.5],
  'Kawasindi Island':[-11.5,34.4],
  'Kamamba Island':[-12,34.5],
  'Thundu':[-14,34.9],
  'R├¡o Cauca':[5.5,-76],
  'Ninde':[-10.3,34.1],
  'Similan Island':[8.6,97.6],
  'Seven Brothers Island':[12.4,43.4],
  'NΓÇÖkolongwe':[-14.2,34.9],
  'Bermuda':[32.3,-64.8],
  'Indo-Pacific Ocean':[-5,100],
  'Moyobozi North':[-7,30.5],
  'Nondwa Point':[-7.5,30.6],
  'Kasakalawe':[-8.6,31.1],
  'Luhanga':[-5.5,29.8],
  'Rutunga':[-4.5,29.5],
  'Segunga (South)':[-5.3,29.7],
  'Mun River Basin':[15,104],
  'Tahiti Society Islands':[-17.7,-149.5],
  'Ticino River ':[45,8.8],
  'Gironde':[45.2,-0.7],
  'Mwela':[-14,34.9],
  'Marova Lagoon':[-8.5,158],
  'Azores Islands':[38.7,-27.2],
  'Lombok Island':[-8.6,116.3],
  'Itirapina':[-22.2,-47.8],
  'Wikihi':[-5,29.7],
  'Usisya':[-10.9,34.2],
  'Gulf of Thailand':[10,101],
  'Nyegezi Bay':[-2.5,32.9],
  'Amazon basin':[-3,-60],
  'Crystal Cove State Park':[33.6,-117.8],
  'Triton Bay':[-3.9,134.1],
  'St. BarthΓÇÖs':[17.9,-62.8],
  'Mar de Plata':[-38,-57.5],
  'Bilila Island':[-12.5,34.5],
  'Sharm el Luly':[24.6,35.1],
  'Ngeruktabel Island':[7.3,134.4],
  'Gambier Archipelago':[-23.1,-135],
  'Catalina Island':[33.4,-118.4],
  'Darros Island':[-5.4,53.3],
  'Kish Island':[26.5,54],
  'Sambilano River':[-15.8,46.2],
  'C├┤te d\'Ivoire':[7.5,-5.5],
  'Kitumba':[-4.5,29.5],
  'Sea of Cortez':[26,-110],
  'Kranket Island':[-5.2,145.8],
  'Lac Fwa':[-5.5,27],
  'Itinilo Rocks':[-12,34.5],
  'Lake Chilwa':[-15.3,35.6],
  'Lacanja River':[16.8,-91.3],
  'Ribbon Reef':[-15,145],
  'Tanintharyi River Drainage':[14,98.5],
  'Gangehi':[4.4,73],
  'Kerenge Island':[-12.5,34.5],
  'Igarap├⌐ Ambe':[-3,-60],
  'Little Colorado River':[35.8,-111.5],
  'Selvagens Island':[30.1,-15.9],
  'Rio Guapore':[-12.5,-64],
  'Lake Nicaragua':[11.5,-85.5],
  'Klamath River':[41.5,-124],
  'St. Johns Reef':[23.6,36],
  'Mdoka Reef':[-11.5,34.2],
  'Vizhinjam':[8.4,76.9],
  'Scorpion Reef':[22.4,-89.7],
  'VavaΓÇÖu':[-18.7,-174],
  'Okinawa Pref':[26.5,128],
  'Izinga Island':[-12.3,34.5],
  'Zimbabwe Rock':[-14,34.9],
  'Agua Caliente':[23,-104],
  'Araguaia Drainage':[-13,-50],
  'Rhineland':[50.9,6.9],
  'Vit├│ria Do Xingu':[-3.3,-52],
  'Goa':[15.5,74],
  'Almoloya':[19.4,-99.8],
  'Lake Xilo├í':[12.2,-86.3],
  'Babi Island':[1.6,125],
  'Mexican Gulf':[25,-90],
  'Kri Island':[-0.5,130.6],
  'Lake Kyoga':[1.5,33],
  'Domira Bay':[-12.5,34.4],
  'Bujumbura':[-3.4,29.4],
  'Baleares':[39.5,3],
  'Fairy Bower':[-33.8,151.3],
  'R├¡o de la Plata Drainage ':[-34.5,-58],
  'Missouri River':[39,-95.5],
  'Skeleton Coast':[-20.5,13],
  'Penga Penga Island':[-13,34.6],
  'Chilucha Reef':[-11.5,34.3],
  'Port Ghalib':[25.5,34.4],
  'Key Largo':[25.1,-80.4],
  'Iskut River':[56.7,-131.5],
  'Lake Managua':[12.4,-86.3],
  'Pilcomavo River':[-22,-63],
  'Morella Beach':[1.5,125],
  'One Tree Island':[-23.5,152.1],
  'Danakil Depression':[14.2,40.3],
  'Ningaloo Reef':[-22.5,113.7],
  'Laguna Ocotal':[16.5,-91.5],
  'Ataran River Basin':[16,98.5],
  'Caldeir├úo':[-3,-60],
  'Dawei':[14.1,98.2],
  'Chinuni':[-6.5,30.3],
  'Sai Kung':[22.4,114.3],
  'Conch Reef':[24.9,-80.5],
  'Hippo Point':[-14,34.8],
  'Kura River Drainage':[41,48],
  'Totomi':[34.6,137.8],
  'Lumbila':[12.5,-1.4],
  'El Churince Spring':[26.8,-102.1],
  'Savitri River':[18,73],
  'R├¡o Pepe':[16.5,-92],
  'Lake Mareotis':[31.2,29.9],
  'Membe Point':[-10.8,34.2],
  'Fuawe Island':[-7,30.5],
  'Makokola':[-14.3,35.1],
  'Bakau':[13.5,-16.7],
  'Madang':[-5.2,145.8],
  'Msuli':[-14,34.9],
  'Fernando de Noronha':[-3.9,-32.4],
  'Taiwan':[23.5,121],
  'Arno':[43.8,11.3],
  'Heard Island':[-53.1,73.5],
  'Gippsland Lakes':[-37.9,147.6],
  'Pasaganado':[-8.5,119.5],
  'Brazzaville':[-4.3,15.3],
  'Nsinje':[-14.5,35.3],
  'Kanchedza Island':[-14.4,35.2],
  'Nelson Bay':[-32.7,152.1],
  'South Jeddah':[21.3,39.1],
  'Raja Ampat Islands':[-0.5,130.7],
  'Gilimanuk':[-8.2,114.4],
  'Karachi':[24.9,67],
  'Nkhungu Reef':[-13.5,34.7],
  'Sakthikulangra':[9,76.5],
  'Iowa':[42,-93.5],
  'Broken Bay':[-33.5,151.3],
  'Sapodilla Cayes':[16.1,-88.3],
  'Rio Salobra Basin':[-20.2,-56.7],
  'Mississippi River':[32,-91],
  'Waikiki':[21.3,-157.8],
  'Rio Solim├╡es-Amazonas':[-3.3,-60],
  'Lower Amazon Basin':[-2,-55],
  'Lufubu':[-8.5,31],
  'Kala Bay':[-8.2,30.9],
  'Chiwanga':[-6,29.9],
  'Vellach River':[46.5,14.5],
  'Rio Copal':[16,-92],
  'Bougainville Reef':[-15.5,147.1],
  'Florida Keys':[24.7,-81.5],
  'Khasi Hills':[25.5,91.7],
  'Augulpelu Reef':[-13,34.5],
  'Candelaria River':[18.2,-91],
  'East Dam':[22.3,114.3],
  'Walo Island':[-5.5,145.8],
  'Dinadiawan':[15.9,121.9],
  'Belize':[17.2,-88.5],
  'Chiwi Rock':[-13.5,34.7],
  'Norfolk Island':[-29,168],
  'Resha':[-4.5,29.5],
  'Sipadan Island':[4.1,118.6],
  'Lake Chilingali':[-13.5,34.7],
  'Guraidhoo West Giri':[3.9,73.5],
  'Lubugwe Bay':[-8.4,31],
  'Cenote Escondido':[20.2,-87.5],
  'Anchor Island':[-16.9,177.4],
  'Paraguay River':[-22,-58],
  'Rio Tigre Drainage':[-2,-76],
  'Rio Oiapoque':[3.8,-51.8],
  'Lundo':[-11.5,34.4],
  'Cross Lake':[54.6,-97.8],
  'Passa Tres Cave':[-24.5,-49],
  'Maintsomalaza River':[-18.5,47],
  'Nottoway River':[36.8,-77.2],
  'Lake Edward':[-0.3,29.6],
  'Nagada':[-5.2,145.8],
  'Indonesia':[-5,120],
  'Bulari Pass':[-22.4,166.4],
  'Tumnin River':[48.5,139.5],
  'Ngkuyo Island':[-5.5,145.8],
  'Bandrele':[-12.9,45.2],
  'Lake Ravelobe':[-16.3,46.7],
  'Corubal River':[12,-14],
  'San Diego':[32.7,-117.2],
  'Great Astrolabe Reef':[-18.8,178.5],
  'Rio Paraguay':[-22,-58],
  'Pebas':[-3.3,-71.8],
  'Ilha Redonda':[-23,-44.6],
  'Enderbury Island':[-3.1,-171.1],
  'Sichuan':[30.5,104],
  'Kitenge Rock':[-6.5,30.3],
  'Sibwesa':[-8,30.8],
  'Arctic Ocean':[75,0],
  'Likoma':[-12.1,34.7],
  'Cape Province':[-34,18.5],
  'Appo Island Zamboanguita':[9.2,123.3],
  'R├¡o Ventuari':[4,-65.5],
  'Laos':[18,105],
  'Bassano':[45.8,11.7],
  'Rio Tapaj├│s':[-5,-57],
  'Bangka Island':[-2,106],
  'Rio Ariranhas':[-2,-63],
  'Ogowe Basin':[-1,10],
  'Solim├╡es River':[-3.3,-60],
  'Rio Pisco':[-13.7,-76.2],
  'Matambukira Rocks':[-14,34.8],
  'Noumea':[-22.3,166.5],
  'Mbita Island':[-14,34.8],
  'Rio Maranon':[-5,-77],
  'Hideaway Island':[-17.7,168.3],
  'Pantar Island':[-8.4,124.2],
  'Banc Rouge':[-22.3,166.5],
  'Robinson Crusoe Island':[-33.6,-78.8],
  'Rio Capivara':[-14,-44],
  'Masaplod Norte':[9.3,123.3],
  'Chilliwack River':[49.1,-121.7],
  'Lake Izabal':[15.5,-89.2],
  'Chile':[-33.5,-70.6],
  'Samarai Island':[-10.6,150.7],
  'Catatumbo River ':[9,-72.5],
  'Mitande Rocks':[-13,34.6],
  'Cachoeira Porteira':[-1.1,-57],
  'Icana River':[1.5,-68.5],
  'Korongwe':[-5.2,29.7],
  'Yunnan':[25,101.5],
  'Jungle Beach':[6.1,80.2],
  'Ucayali':[-8,-74],
  'Shur':[28,56],
  'North of Kigoma':[-4.8,29.6],
  'Guapor├⌐ River':[-12.5,-64],
  'Smith Sound':[78,-73],
  'Chiwi Rocks':[-13.5,34.7],
  'Chindwin river':[22,95],
  '1000 Steps Bonaire':[12.2,-68.3],
  'Pahang Basin':[3.5,102.5],
  'Fiji':[-18,179],
  'Indus River':[25.4,68.4],
  'Nkhoso Point':[-14,34.9],
  'Marina Bay':[1.3,103.9],
  'Lizard Island':[-14.7,145.5],
  'Russel Islands':[-9,159],
  'Nacala':[-14.5,40.7],
  'Cabo Pulmo':[23.4,-109.4],
  'Myitkyina':[25.4,97.4],
  'Cueva Chica Cave':[22,-99],
  'Dolphin House':[25.8,34.4],
  'Lough Melvin':[54.4,-8.1],
  'North West Shelf':[-19,116],
  'Utinta':[-7,30.5],
  'Aral Sea':[45,60],
  'Chitimba Bay (Shallow)':[-10.6,34.2],
  'Lutara Reef':[-11.5,34.3],
  'Lake Antogonama':[-18,47],
  'Trinidade Island':[-20.5,-29.3],
  'Indian & Pacific Ocean':[-5,100],
  'Lough Coomasaharn':[51.8,-9.9],
  'Kala':[-8.2,30.9],
  'Tsitsikamma National Park':[-33.9,23.9],
  'Ancon':[-11.8,-77.2],
  'Nuku Hiva':[-8.9,-140.1],
  'Maharashtra':[19,76],
  'Eiao ':[-8,-140.7],
  'Gombe National Park':[-4.6,29.6],
  'Lope National Park':[-0.5,11.5],
  'Aleutian Islands':[52,-175],
  'Wakatobi':[-5.5,123.8],
  'Muzimu':[-6.5,30.3],
  'Bima Bay':[-8.4,118.7],
  'Chadagha':[-5.5,29.8],
  'Tungkang':[22.4,120.4],
  'Tartar Strait':[49,141],
  'Chandika':[-6,29.9],
  'Galapagos Islands':[-0.9,-89.6],
  'Jervis Bay':[-35.1,150.7],
  'Gode-Gaz':[6,43.5],
  'Maracaibo Basin':[9.5,-71.5],
  'Alorkol':[3.5,36],
  'Nkamba Bay':[-8.7,31.1],
  'Paradise Valley':[33.5,-4.5],
  'Thade River':[3,38],
  'Itapemim River':[-21,-40.8],
  'La Plata River Basin':[-34.5,-58],
  'Rio Madeira':[-8.8,-64],
  'Batang Hari':[-1.6,103.6],
  'Lagoon Reef':[-16.9,177.4],
  'Alabama':[32.5,-87],
  'Rio Capin':[-2.5,-48.5],
  'Gorontalo':[0.5,123],
  'Nasau':[-5,29.7],
  'Gazelle Lake':[-4.5,152],
  'Ul├⌐a':[-3.2,-52],
  'Esmeraldas':[0.9,-79.7],
  'Rowley Shoals':[-17.3,119.3],
  'Ilha Vit├│ria':[-23.8,-45],
  'Verde Passage':[13.5,121],
  'Lake Bulera':[-1.5,29.7],
  'Magara':[-4,29.3],
  'Sharm el Sheikh ':[27.9,34.3],
  'Karang Asem':[-8.4,115.6],
  'Nkopola':[-14.3,35.1],
  'Lufubu South':[-8.6,31],
  'DevilΓÇÖs Hole':[36.4,-116.3],
  'Cenderawasih Bay':[-2.5,135.5],
  'Opatha':[-5,29.6],
  'Cemetery Lagoon':[-22.3,166.5],
  'Mururoa Atoll':[-21.8,-138.8],
  'Catatumbo River':[9,-72.5],
  'Okinawa pref.':[26.5,128],
  'Mzwema':[-14,34.9],
  'Uruguay River Basin':[-31.5,-58],
  'Bay of Bengal':[15,88],
  'La Becerra Pool':[26.8,-102.1],
  'Isla Mujeres':[21.2,-86.7],
  'Saint Martin Island':[18.1,-63.1],
  'Igarap├⌐ Macuari':[-3,-60],
  'Charo':[-5.5,29.8],
  'Andros':[24.7,-78],
  'Dagua River Basin':[3.7,-77],
  'Gunung Api':[-6.6,126.6],
  'Syr Darya Basin':[41,68],
  'La Pax':[-16.5,-68.2],
  'Moyobozi South':[-7.2,30.5],
  'Kanjindo Rocks':[-13,34.6],
  'Laguna Larga':[18.3,-87.7],
  'Twins Island':[-14,34.8],
  'Juma Island':[-7.9,39.7],
  'Rio Choluteca':[13.3,-87.2],
  'Rondonia':[-11,-62],
  'Igarap├⌐ Barir├¡':[-3,-60],
  'Cape Kapemba':[-14.2,34.9],
  'Serra dos Caraj├ís':[-6,-50],
  'Msamba':[-10.5,34.2],
  'Ishigakijima Island':[24.3,124.2],
  'Domwe Island':[-14,34.8],
  'Rio Monda':[-3.4,-60],
  'Attycelley Creek':[-38,145],
  'Ogasawara':[27.1,142.2],
  'Rio Paragua├ºu Basin':[-12.6,-41],
  'Nankoma Island':[-13.3,34.6],
  'Rio Nexapa':[17,-92.5],
  'Union Island':[-16.9,177.4],
  'Lake Kingiri':[-1.5,33.5],
  'Lake Abaeded':[15,39.5],
  'Lumessi':[-15,35.3],
  'Chia':[4.9,-74.1],
  'Akumai':[20.4,-87.3],
  'Aripuan├ú River':[-7,-60.5],
  'Fraser River':[49.2,-122.5],
  'Moba':[-7,29.8],
  'Tunicate Cove':[-5,145.5],
  'Mzungu Beach':[-14,34.8],
  'Mamore River':[-15,-65],
  'Murchison Bay':[0.3,32.6],
  'Wuhan':[30.6,114.3],
  'Alaska':[61,-150],
  'Rapa':[-27.6,-144.3],
  'Lueba':[-5.5,29],
  'Apalachicola River':[30,-85],
  'Lake Tumba':[-0.8,18],
  'Oahu':[21.4,-157.9],
  'Milhaidhoo':[5,73],
  'Ilha Escalvada':[-20.7,-40.4],
  'Ryukyu Islands':[26.5,128],
  'Borneo':[1,115],
  'Swains Reefs':[-22,152.5],
  'R├¡o Orinoco':[7,-65],
  'Illusions Lagoon':[-22.3,166.5],
  'Lihou Reef':[-17.1,152],
  'Adams River':[51,-119],
  'Miramar':[23.2,-82.4],
  'Sunamganj':[25.1,91.4],
  'Chatham Bay':[-17.7,168.3],
  'El Gouna':[27.2,33.7],
  'Mbamba Islands':[-11.4,34.5],
  'Masasa Reef':[-13.5,34.7],
  'Revillagigedo Archipelago':[18.8,-111],
  'Samdrup Jongkhar':[26.8,91.5],
  'Buko':[-4.5,29.5],
  'Mindoro':[12.5,121],
  'Monkey Bay':[-14.1,34.9],
  'Quintana Roo':[19.5,-88],
  'Lake Volta':[7.5,-0.5],
  'Ninepin Islands':[22.2,114.3],
  'R├¡o Ucayali':[-8,-74],
  'Lake Victoria':[-1.5,33],
  'Ostuta':[16.5,-94],
  'New Guinea Reef':[-5,145.5],
  'Rio Vichada':[4.5,-69.5],
  'Calabozo':[8.9,-67.4],
  'Little Cayman':[19.7,-80],
  'Rio Trombetas':[-1.8,-55.8],
  'Crocodile Rocks':[-13,34.5],
  'Aguayt├¡a River':[-9.2,-75.5],
  'Cumar├║':[2.5,-66.5],
  'Sea of Okhotsk':[55,150],
  'Hora Mango':[6.5,38.5],
  'Suratte':[6,80.2],
  'Malope':[-10.5,34.2],
  'Chidunga Rock':[-13.7,34.8],
  'Njambe':[-10.5,34.2],
  'Sambia Reef':[-14,34.8],
  'Rio Ca├▒averal':[10.9,-75],
  'Southern Tanzania':[-10,35],
  'Lwili Island':[-12.5,34.5],
  'Rio Pindar├⌐':[-5,-45],
  'Meme River N16':[5,9.5],
  'Nkolongwe':[-14.2,34.9],
  'Mboko':[-4.8,29.5],
  'North Jeddah':[21.7,39.2],
  'Magambo':[-11,34.2],
  'Peter the Great Bay':[42.5,131.5],
  'Ikwasi':[-11.5,34.3],
  'Lough Leane':[52,-9.5],
  'Miyazaki':[31.9,131.4],
  'Kizinga':[-14.5,35.2],
  'Lake Xiloe':[12.2,-86.3],
  'Ujiji':[-4.9,29.7],
  'Rio Coto':[8.6,-83],
  'Linangu':[-12,34.5],
  'Queensland':[-22,149],
  'Galo':[-10.5,34.2],
  'Provincia de Misiones':[-27,-54.5],
  'Kande Island':[-11.7,34.3],
  'Devil\'s Grotto':[19.3,-81.4],
  'Derable River':[-4.7,55.5],
  'Batu Ata':[-8.5,119.5],
  'Maswa':[-11.5,34.3],
  'Cape Chaitika':[-8.6,31.1],
  'Sanga':[-10.5,34.2],
  'Nkhungu Point':[-13.5,34.7],
  'Puerto Escondido':[15.9,-97.1],
  'Kemp':[-14.5,35.3],
  'Lupingu':[-10.5,34.2],
  'Sumbu Island':[-8.7,31],
  'Cape Kipimbi':[-7.6,30.6],
  'Lake Amatitl├ín':[14.5,-90.5],
  'Eastern United States':[37,-80],
  'R├¡o Chalchijapan':[17.8,-92.9],
  'Tanzania':[-6,35],
  'Muzimi':[-6.5,30.3],
  'Katando Point':[-7,30.5],
  'Global':[20,0],
  'Orinoco Drainage':[7.5,-64],
  'R├¡o Querecual':[10,-64.5],
  'Rio Tef├⌐':[-3.4,-64.7],
  'Izinga':[-12.3,34.5],
  'Chalumna River':[-33.5,27.5]
};

// ── Equirectangular helpers ───────────────────────
function lonLatToCanvas(lon, lat, W, H) {
  return [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
}
function latLonToXYZ(lat, lon, r) {
  const phi   = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// ── Canvas earth texture ──────────────────────────
function createEarthTexture() {
  const W = 2048, H = 1024;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Ocean gradient
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0,   '#0d4f7a');
  grd.addColorStop(0.3, '#1976a0');
  grd.addColorStop(0.7, '#1976a0');
  grd.addColorStop(1,   '#0d4f7a');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Ocean wave shimmer lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let y = 20; y < H; y += 24) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const wy = y + Math.sin(x * 0.025) * 3;
      x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }

  // Draw landmasses
  LANDMASSES.forEach(lm => {
    ctx.beginPath();
    lm.pts.forEach(([lon, lat], i) => {
      const [x, y] = lonLatToCanvas(lon, lat, W, H);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = lm.col;
    ctx.fill();
    // Outline
    const darker = lm.col.replace(/^#/, '');
    const r = parseInt(darker.slice(0,2),16), g = parseInt(darker.slice(2,4),16), b = parseInt(darker.slice(4,6),16);
    ctx.strokeStyle = `rgba(${Math.max(0,r-30)},${Math.max(0,g-30)},${Math.max(0,b-30)},0.6)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Polar glow overlays
  const northGrd = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, H*0.2);
  northGrd.addColorStop(0,   'rgba(220,240,255,0.55)');
  northGrd.addColorStop(1,   'rgba(220,240,255,0)');
  ctx.fillStyle = northGrd;
  ctx.fillRect(0, 0, W, H*0.2);

  const southGrd = ctx.createRadialGradient(W/2, H, 0, W/2, H, H*0.2);
  southGrd.addColorStop(0,   'rgba(220,240,255,0.55)');
  southGrd.addColorStop(1,   'rgba(220,240,255,0)');
  ctx.fillStyle = southGrd;
  ctx.fillRect(0, H*0.8, W, H*0.2);

  return new THREE.CanvasTexture(c);
}

// ── Cloud texture ─────────────────────────────────
function createCloudTexture() {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const CLOUDS = [
    [0.08,0.25,90,28],[0.15,0.18,70,22],[0.22,0.30,110,30],[0.30,0.22,80,20],
    [0.38,0.28,95,25],[0.45,0.20,75,18],[0.52,0.32,100,28],[0.60,0.24,85,22],
    [0.68,0.19,70,20],[0.75,0.28,90,24],[0.82,0.22,80,18],[0.90,0.30,100,26],
    [0.05,0.68,80,22],[0.18,0.72,95,26],[0.30,0.65,70,20],[0.42,0.70,85,24],
    [0.55,0.67,90,22],[0.65,0.73,75,20],[0.78,0.68,95,26],[0.88,0.72,80,22],
    [0.12,0.45,100,20],[0.28,0.50,80,18],[0.50,0.42,90,22],[0.70,0.48,85,20],
    [0.92,0.44,75,18],[0.35,0.55,110,24],[0.60,0.52,90,20],[0.80,0.55,95,22],
  ];
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  CLOUDS.forEach(([cx, cy, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(cx * W, cy * H, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  return new THREE.CanvasTexture(c);
}

// ── Build locality data from FISH_DATA + LOC_COORDS ──
function buildLocData() {
  const map = {};
  FISH_DATA.forEach(f => {
    if (!f.locality || !LOC_COORDS[f.locality]) return;
    if (!map[f.locality]) {
      const [lat, lon] = Array.isArray(LOC_COORDS[f.locality][0])
        ? LOC_COORDS[f.locality][0]
        : LOC_COORDS[f.locality];
      map[f.locality] = { name: f.locality, lat, lon, count: 0, fish: [] };
    }
    map[f.locality].count++;
    if (map[f.locality].fish.length < 8 && f.image)
      map[f.locality].fish.push(f);
  });
  const locs = Object.values(map).sort((a, b) => b.count - a.count);

  // Pre-compute nearby localities (within ~0.7° ≈ 78 km)
  const THRESH = 0.7;
  locs.forEach(loc => {
    loc.nearby = locs.filter(other =>
      other !== loc &&
      Math.abs(other.lat - loc.lat) < THRESH &&
      Math.abs(other.lon - loc.lon) < THRESH
    ).sort((a, b) => b.count - a.count);
  });

  return locs;
}

// ── Zoom-adaptive clustering ──────────────────────
let currentClusters = [];
let lastAlt         = -1;
let clusterRafId    = null;

function clusterLocs(locs, threshDeg) {
  const used     = new Array(locs.length).fill(false);
  const clusters = [];
  for (let i = 0; i < locs.length; i++) {
    if (used[i]) continue;
    const base    = locs[i];
    const members = [base];
    used[i] = true;
    for (let j = i + 1; j < locs.length; j++) {
      if (used[j]) continue;
      if (Math.abs(locs[j].lat - base.lat) < threshDeg &&
          Math.abs(locs[j].lon - base.lon) < threshDeg) {
        members.push(locs[j]);
        used[j] = true;
      }
    }
    const total = members.reduce((s, m) => s + m.count, 0);
    const lat   = members.reduce((s, m) => s + m.lat * m.count, 0) / total;
    const lon   = members.reduce((s, m) => s + m.lon * m.count, 0) / total;
    const fish  = [];
    const seen  = new Set();
    for (const m of members)
      for (const f of m.fish)
        if (!seen.has(f.tokenId) && fish.length < 8) { fish.push(f); seen.add(f.tokenId); }
    clusters.push({
      lat, lon, count: total, fish,
      hue:       members[0].hue,
      isCluster: members.length > 1,
      size:      members.length,
      name:      members.length === 1
        ? members[0].name
        : members[0].name + (members.length > 1 ? ` +${members.length - 1}` : ''),
      locs:   members,
      nearby: members.length === 1 ? (members[0].nearby || []) : [],
    });
  }
  return clusters;
}

function updateGlobeClusters() {
  if (!globeInstance) return;
  // Cluster once with very tight threshold — only truly overlapping locations merge
  currentClusters = clusterLocs(locDataArr, 0.12);
  globeInstance.pointsData(currentClusters);
}

function scheduleClusterUpdate() {
  // No-op: clustering is static, no re-clustering on zoom
}

// ── Main init ─────────────────────────────────────

// ── Init Globe (globe.gl) ─────────────────────────
function initGlobe() {
  if (globeInitialized) return;
  globeInitialized = true;

  const el = document.getElementById('globe-canvas');
  if (!el) { globeInitialized = false; return; }

  locDataArr = buildLocData();
  locDataArr.forEach((loc, i) => { loc.hue = (i * 47) % 360; });

  if (!window.Globe) {
    console.error('[CryptoFish] Globe library not loaded');
    globeInitialized = false;
    return;
  }

  const W = el.offsetWidth  || el.parentElement?.offsetWidth  || 600;
  const H = el.offsetHeight || el.parentElement?.offsetHeight || 500;

  globeInstance = Globe()
    .width(W).height(H)
    .backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .atmosphereColor('#c8ddf5')
    .atmosphereAltitude(0.08)
    .pointsData([])
    .pointLat(d => d.lat)
    .pointLng(d => d.lon)
    .pointAltitude(d => d.isCluster ? 0.06 : 0.04)
    .pointRadius(d => {
      const base = Math.log(Math.min(d.count, 80) + 1) / Math.log(81);
      return d.isCluster ? 0.45 + base * 0.65 : 0.3 + base * 0.5;
    })
    .pointColor(d => d.isCluster ? `hsl(${d.hue},70%,60%)` : `hsl(${d.hue},90%,55%)`)
    .pointResolution(16)
    .onPointClick(d => { _focusByData(d); showPopover(d); })
    .onGlobeClick(() => closePopover())
    .pointLabel(d => {
      const sub = d.isCluster
        ? `${d.size} localities · ${d.count} fish`
        : `${d.count} CryptoFish`;
      return `<div style="background:rgba(15,15,30,.88);color:#fff;padding:8px 12px;border-radius:10px;font-family:Inter,sans-serif;font-size:12px;max-width:220px"><b>${d.name}</b><br><span style="opacity:.75">${sub}</span></div>`;
    });

  globeInstance(el);

  // Hide until morph/pastel applied to avoid sphere flash
  el.style.opacity = '0';

  // Auto-rotate
  globeInstance.controls().autoRotate      = true;
  globeInstance.controls().autoRotateSpeed = 0.5;
  globeInstance.controls().enableDamping   = true;

  let autoTimer;
  const stopAuto   = () => { globeInstance.controls().autoRotate = false; clearTimeout(autoTimer); };
  const resumeAuto = () => { clearTimeout(autoTimer); autoTimer = setTimeout(() => { if (globeInstance) globeInstance.controls().autoRotate = true; }, 3600); };

  el.addEventListener('mousedown',  stopAuto);
  el.addEventListener('touchstart', stopAuto, { passive: true });
  window.addEventListener('mouseup',    resumeAuto);
  window.addEventListener('touchend',   resumeAuto);

  window.addEventListener('resize', () => {
    if (!globeInstance) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    if (w && h) globeInstance.width(w).height(h);
  });

  // Zoom-adaptive clustering
  globeInstance.controls().addEventListener('change', scheduleClusterUpdate);
  updateGlobeClusters();

  renderLocalityList();

  // Cube morph + pastel tint (wait for texture load)
  setTimeout(() => {
    try {
      morphGlobeShape();
      pastelizeGlobe();
    } catch(e) { console.warn('[CryptoFish] Globe effects error:', e); }
    el.style.transition = 'opacity .5s';
    el.style.opacity = '1';
  }, 800);
}

// ── Cube Morph ────────────────────────────────────
function morphGlobeShape() {
  if (!globeInstance) return;
  const scene = globeInstance.scene();
  const MIX = 0.82;
  scene.traverse(obj => {
    if (!obj.isMesh || !obj.geometry?.attributes?.position) return;
    const pos = obj.geometry.attributes.position;
    if (pos.count < 100) return;
    const r0 = Math.sqrt(pos.getX(0) ** 2 + pos.getY(0) ** 2 + pos.getZ(0) ** 2);
    if (r0 < 10) return;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z);
      if (len < 0.001) continue;
      const nx = x / len, ny = y / len, nz = z / len;
      // Project onto cube face: each axis clamped to [-1,1] cube
      const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
      const maxC = Math.max(ax, ay, az);
      // Smooth cube: use power to flatten edges without sharp corners
      const p = 6; // higher = sharper cube edges
      const cubeDist = Math.pow(Math.pow(ax, p) + Math.pow(ay, p) + Math.pow(az, p), 1/p);
      const cubeScale = 1.0 / cubeDist;
      const morphScale = 1.0 + (cubeScale - 1.0) * MIX;
      pos.setXYZ(i, x * morphScale, y * morphScale, z * morphScale);
    }
    pos.needsUpdate = true;
    obj.geometry.computeVertexNormals();
    obj.geometry.computeBoundingSphere();
  });
}

// ── Pastelize Globe Texture ───────────────────────
function pastelizeGlobe() {
  // No-op: use original globe colors
}



function _focusByData(d) {
  // Works for both clusters and single raw locs
  const primaryLoc = d.locs ? d.locs[0] : d;
  const idx = locDataArr.indexOf(primaryLoc);
  document.querySelectorAll('.locality-item').forEach((el, i) => el.classList.toggle('active', i === idx));
  const items = document.querySelectorAll('.locality-item');
  if (items[idx]) items[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  // Clusters zoom in deep enough to start splitting them
  const curAlt = globeInstance?.pointOfView().altitude ?? 2.5;
  const targetAlt = d.isCluster ? Math.max(0.35, curAlt * 0.42) : 1.4;
  if (globeInstance) globeInstance.pointOfView({ lat: d.lat, lng: d.lon, altitude: targetAlt }, 900);
}

// ── Public: focus by sidebar index ────────────────
function focusLocality(idx) {
  const loc = locDataArr[idx];
  if (!loc) return;
  // Wrap raw loc so showPopover can treat it uniformly
  const item = { ...loc, isCluster: false, size: 1, locs: [loc], nearby: loc.nearby || [] };
  _focusByData(item);
  showPopover(item);
}

// ── Popover ───────────────────────────────────────
function showPopover(item) {
  const isCluster = item.isCluster && item.locs.length > 1;

  document.getElementById('pop-title').textContent = isCluster
    ? item.locs[0].name + ' area'
    : item.locs[0].name;
  document.getElementById('pop-sub').textContent = isCluster
    ? `${item.size} localities · ${item.count} CryptoFish total`
    : `${item.count} CryptoFish · ${item.locs[0].lat.toFixed(1)}°, ${item.locs[0].lon.toFixed(1)}°`;

  const fishArr = item.fish || [];
  document.getElementById('pop-fish').innerHTML = fishArr.length
    ? fishArr.map(f => `<div class="popover-fish"><img src="${f.image}" alt="${f.name}" title="${f.name}" onclick="event.stopPropagation();showFish(${f.tokenId - 1})" loading="lazy"></div>`).join('')
    : '<div class="popover-fish-empty">No images available</div>';

  const nearbyEl = document.getElementById('pop-nearby');
  if (nearbyEl) {
    if (isCluster) {
      nearbyEl.innerHTML =
        `<div class="pop-nearby-label">Localities in this area — zoom in to separate</div>` +
        `<div class="pop-nearby-list">` +
        item.locs.map(loc => {
          const locIdx = locDataArr.indexOf(loc);
          return `<button class="pop-nearby-btn" onclick="focusLocality(${locIdx})">${loc.name} <span class="pop-nearby-count">${loc.count}</span></button>`;
        }).join('') +
        `</div>`;
      nearbyEl.style.display = '';
    } else if (item.nearby && item.nearby.length) {
      nearbyEl.innerHTML =
        `<div class="pop-nearby-label">Nearby localities</div>` +
        `<div class="pop-nearby-list">` +
        item.nearby.slice(0, 8).map(n => {
          const nIdx = locDataArr.indexOf(n);
          return `<button class="pop-nearby-btn" onclick="focusLocality(${nIdx})">${n.name} <span class="pop-nearby-count">${n.count}</span></button>`;
        }).join('') +
        `</div>`;
      nearbyEl.style.display = '';
    } else {
      nearbyEl.style.display = 'none';
    }
  }

  const btn = document.getElementById('pop-explore-btn');
  if (btn) {
    btn.textContent = isCluster ? 'Explore all fish from this area →' : 'Explore all fish from here →';
    btn.onclick = isCluster
      ? () => exploreLocalities(item.locs.map(l => l.name))
      : () => exploreLocality(item.locs[0].name);
  }

  document.getElementById('locality-popover').classList.add('visible');
}

function closePopover() {
  document.getElementById('locality-popover').classList.remove('visible');
  document.querySelectorAll('.locality-item').forEach(el => el.classList.remove('active'));
}

// ── Sidebar list ──────────────────────────────────
function renderLocalityList() {
  const el = document.getElementById('locality-list');
  if (!el || !locDataArr.length) return;
  el.innerHTML = locDataArr.slice(0, 60).map((l, i) => `
    <div class="locality-item" onclick="focusLocality(${i})">
      <div class="locality-dot" style="background:hsl(${l.hue},70%,55%)"></div>
      <div class="locality-info">
        <div class="locality-name">${l.name}</div>
        <div class="locality-count">${l.count} fish</div>
      </div>
      <div class="locality-arrow">›</div>
    </div>`).join('');
}

function buildLocalityFish() {} // no-op
