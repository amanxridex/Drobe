const fs = require('fs');

const raw = fs.readFileSync('scripts/intercepted_test.json', 'utf8');
const data = JSON.parse(raw);

for (const entry of data) {
  if (entry && entry.component_data) {
    for (const k of Object.keys(entry.component_data)) {
      const obj = entry.component_data[k];
      if (obj && (obj.bloc_id === 'iconic_header_cards_row_hp_men' || obj.id === 'iconic_header_cards_row_hp_men')) {
        console.log(JSON.stringify(obj, null, 2));
      }
    }
  }
}
