function loadNavbar() {
  fetch('bar.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('navbar').innerHTML = data;
    });
}

function normalizeName(str) {
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .trim().toUpperCase();
}

function filterAbsent() {
  const listFull = document.getElementById('listFull').value.trim().split('\n').map(normalizeName);
  const listPresent = document.getElementById('listPresent').value.trim().split('\n').map(normalizeName);
  const presentSet = new Set(listPresent);
  const missing = listFull.filter(name => !presentSet.has(name));
  document.getElementById('result').value = missing.join('\n');
}

function copyResult() {
  const output = document.getElementById('result');
  output.select();
  output.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("Đã sao chép kết quả!");
}
