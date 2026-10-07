const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);
const entry11 = data[11];
const widgets = entry11.component_data['0'].widgets;

console.log('Total widgets:', widgets.length);

// Helper to find a bloc anywhere in intercepted data
function findBloc(blocId) {
  for (const entry of data) {
    if (entry && entry.component_data) {
      for (const k of Object.keys(entry.component_data)) {
        const obj = entry.component_data[k];
        if (obj && (obj.bloc_id === blocId || obj.id === blocId)) {
          return obj;
        }
      }
    }
  }
  return null;
}

widgets.slice(0, 16).forEach((wId, idx) => {
  const bloc = findBloc(wId);
  if (bloc) {
    console.log(`\n[${idx}] BLOC: ${wId}`);
    console.log(`  type: ${bloc.type}, heading: ${bloc.heading || bloc.title}`);
    console.log(`  keys: ${Object.keys(bloc).join(', ')}`);
    if (bloc.media) console.log(`  media:`, JSON.stringify(bloc.media).slice(0, 200));
    if (bloc.background_media) console.log(`  background_media:`, JSON.stringify(bloc.background_media).slice(0, 200));
    if (bloc.items) console.log(`  items count:`, bloc.items.length, 'sample:', JSON.stringify(bloc.items[0]).slice(0, 200));
  } else {
    console.log(`\n[${idx}] BLOC: ${wId} NOT FOUND DIRECTLY`);
  }
});
