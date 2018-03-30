const changelog = require('./changelog.json');
const fs = require('fs');

if (changelog.versions && changelog.versions.length > 0) {
  const markdown = [];

  markdown.push(`# Changelog - REST API Tester`);
  markdown.push(``);

  changelog.versions.forEach(v => {
    markdown.push(`## [${v.version}] ${v.date ? `- ${v.date}` : ''}`);
    markdown.push(``);

    if (v.changes) {
      for (const key in v.changes) {
        const typeChange = v.changes[key];
        if (typeChange.length > 0) {
          markdown.push(`### ${key.charAt(0).toUpperCase() + key.slice(1)}`);
          markdown.push(``);
          typeChange.forEach(msg => {
            markdown.push(`- ${msg}`);
          });
          markdown.push(``);
        }
      }
    }
  });

  if (markdown.length > 2) {
    fs.writeFileSync('CHANGELOG.md', markdown.join('\n'));
  }
}
