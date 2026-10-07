const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'intercepted_test.json'), 'utf8'));
const item11 = data[11];

const topBlocIds = [
  'grid_2882',
  'carousel2882',
  'grid_2883',
  'row_2547',
  'banner_1923_hp_men',
  'banner_2965_hp_men',
  'product_row_2966_hp_men',
  'banner_2987_hp_men',
  'product_row_2988_hp_men',
  'banner_2242_hp_men',
  'grid_858',
  'row_861',
  'grid_1643'
];

topBlocIds.forEach(bid => {
  const comp = item11.component_data.find(c => c.bloc_id === bid);
  if (comp) {
    console.log('=== BLOC:', bid, 'TYPE:', comp.type, 'HEADING:', comp.heading?.text || comp.heading || comp.title || '');
    if (comp.items) {
      console.log('  Items count:', comp.items.length);
      console.log('  First item:', JSON.stringify(comp.items[0], null, 2));
    }
    if (comp.media) {
      console.log('  Media:', JSON.stringify(comp.media, null, 2));
    }
    if (comp.background_media) {
      console.log('  BG media:', JSON.stringify(comp.background_media, null, 2));
    }
  }
});
