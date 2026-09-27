// Prepares shared assets for the design pistes (pistes/assets): resized photos, brand files, map data.
import sharp from 'sharp';
import { readdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { feature } from 'topojson-client';

const OUT = 'pistes/assets';
const SRC = 'src/assets/photos';
let total = 0;
for (const f of readdirSync(SRC)) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const base = f.replace(/\.(jpe?g|png)$/i, '');
  const meta = await sharp(`${SRC}/${f}`).metadata();
  for (const [suffix, w] of [['', 1600], ['-800', 800]]) {
    const info = await sharp(`${SRC}/${f}`)
      .flatten({ background: '#ffffff' })
      .resize({ width: Math.min(w, meta.width), withoutEnlargement: true })
      .sharpen({ sigma: 0.6 })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(`${OUT}/photos/${base}${suffix}.jpg`);
    total += info.size;
  }
}
console.log('photos', Math.round(total / 1024) + 'KB');

for (const f of ['alfec-logo.png', 'alfec-logo-white.png', 'alfec-mark.png']) copyFileSync(`src/assets/brand/${f}`, `${OUT}/brand/${f}`);
for (const [f, o] of [['slogan.png', 'slogan-fr.png'], ['slogan-en.png', 'slogan-en.png']]) {
  await sharp(`.snapshot/alfec.net-2026-09-26/img/${f}`).trim().png().toFile(`${OUT}/brand/${o}`);
}

// Map: Algeria outline and the 22 wilayas published on alfec.net.
const wilayas = [
  ['Oran', 35.72116, -0.557245], ['Alger', 36.769177, 3.054911], ['Adrar', 27.970139, -0.199894], ['Annaba', 36.915012, 7.752668],
  ['Constantine', 36.350527, 6.632652], ['Laghouat', 33.800098, 2.869715], ['Tlemcen', 34.881941, -1.308805], ['El Oued', 33.369173, 6.850245],
  ['Béchar', 31.618494, -2.21538], ['Saïda', 34.833056, 0.15], ['Mostaganem', 35.933056, 0.090278], ['Mascara', 35.394444, 0.139722],
  ['Tissemsilt', 35.604853, 1.807647], ['Naâma', 33.171308, -0.374806], ['Jijel', 36.799722, 5.766667], ['Bouira', 36.38, 3.901389],
  ['Tiaret', 35.36726, 1.313074], ['Chlef', 36.164722, 1.335], ['Boumerdès', 36.766667, 3.477222], ['Mila', 36.451959, 6.25859],
  ['Béjaïa', 36.75, 5.083056], ['Guelma', 36.466111, 7.433889],
];
const world = JSON.parse(readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const alg = feature(world, world.objects.countries).features.find((f) => f.id === '012');
const ring = alg.geometry.coordinates[0];
const lons = ring.map(([x]) => x), lats = ring.map(([, y]) => y);
const minLon = Math.min(...lons), maxLon = Math.max(...lons), minLat = Math.min(...lats), maxLat = Math.max(...lats);
const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const W = 600, scale = W / ((maxLon - minLon) * k), H = Math.round((maxLat - minLat) * scale);
const pr = (lon, lat) => [+((lon - minLon) * k * scale).toFixed(1), +((maxLat - lat) * scale).toFixed(1)];
const outline = ring.map(([lo, la], i) => { const [x, y] = pr(lo, la); return `${i ? 'L' : 'M'}${x} ${y}`; }).join('') + 'Z';
const points = wilayas.map(([name, lat, lng]) => { const [x, y] = pr(lng, lat); return { name, x, y, hq: name === 'Oran' }; });
writeFileSync(`${OUT}/map.js`, `// Algeria outline (Natural Earth 1:50m, public domain) and the 22 wilayas published on alfec.net.\nwindow.ALFEC_MAP = ${JSON.stringify({ w: W, h: H, outline, points })};\n`);
console.log('map', W + 'x' + H, points.length, 'points');
