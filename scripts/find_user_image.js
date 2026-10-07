const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/vinod/.gemini/antigravity-ide/brain/7501387e-21a8-46a5-a050-38c041249a52/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":1686')) {
    const obj = JSON.parse(line);
    console.log(obj.content);
  }
});
