export const parseTable = (md) => {
  const rows = md.trim().split(/\r?\n/g).map(row => row.split('|').map(cell => cell.trim()));
  const keys = rows.shift(); // first row is header
  return rows.map(row => {
    const obj = {};
    keys.forEach((key, i) => {
      if ('' == key) { return; }
      obj[key] = row[i];
    });
    return obj;
  });
};