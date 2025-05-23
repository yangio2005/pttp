function loadNavbar() {
  fetch('bar.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('navbar').innerHTML = data;
    });
}

function removeVietnameseTones(str) {
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D");
}

function convertText() {
  const input = document.getElementById('inputText').value;
  const rows = input.trim().split('\n');
  const output = rows.map(row =>
    row.split('\t').map(cell => removeVietnameseTones(cell)).join('\t')
  ).join('\n');
  document.getElementById('outputText').value = output;
}

function copyOutput() {
  const output = document.getElementById('outputText');
  output.select();
  output.setSelectionRange(0, 99999); // for mobile
  document.execCommand("copy");
  alert("Đã sao chép kết quả!");
}
