function loadNavbar() {
  fetch('bar.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('navbar').innerHTML = data;
    });
}
document.getElementById('qrForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const dataType = document.getElementById('dataType').value;
    const inputData = document.getElementById('inputData').value.trim();
    const color = document.getElementById('color').value;
    const size = document.getElementById('size').value;

    if (inputData === "") {
        alert("Vui lòng nhập thông tin để tạo mã QR!");
        return;
    }

    let qrData = '';
    switch (dataType) {
        case 'text':
            qrData = inputData;
            break;
        case 'url':
            if (!/^https?:\/\//.test(inputData)) {
                alert("URL không hợp lệ. Vui lòng bắt đầu bằng http:// hoặc https://");
                return;
            }
            qrData = inputData;
            break;
        case 'email':
            qrData = `mailto:${inputData}`;
            break;
        case 'phone':
            qrData = `tel:${inputData}`;
            break;
        case 'sms':
            qrData = `sms:${inputData}`;
            break;
        case 'wifi':
            qrData = `WIFI:T:WPA;S:${inputData};P=;`;
            break;
        default:
            alert("Loại mã QR không hợp lệ.");
            return;
    }

    // Tạo QR code với màu và kích thước tùy chọn
    const qrCode = new QRCode(document.getElementById("qrcode"), {
        text: qrData,
        width: parseInt(size),
        height: parseInt(size),
        colorDark: color,    // Màu mã QR
        colorLight: "#ffffff", // Màu nền mã QR
        correctLevel: QRCode.CorrectLevel.H,  // Cấp độ sửa lỗi
    });

    // Hiển thị nút tải về
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.style.display = 'inline-block';

    downloadBtn.onclick = function() {
        const canvas = document.querySelector("#qrcode canvas");
        const imageUrl = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'qrcode.png';
        link.click();
    };
});
