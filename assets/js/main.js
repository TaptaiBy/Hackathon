// main.js – xử lý upload file .gpx và hiển thị kết quả lên dashboard

async function verifyWorkout() {
  // Lấy element input file và div hiển thị kết quả
  const fileInput = document.getElementById('gpxFileInput');
  const resultDiv = document.getElementById('mlResult');

  // Kiểm tra đã chọn file chưa
  if (!fileInput.files[0]) {
    resultDiv.innerText = '❌ Please choose a .gpx file.';
    return;
  }

  // Tạo formData để gửi file lên backend
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  // Hiện thông báo đang kiểm tra
  resultDiv.innerText = '⏳ Verifying...';

  try {
    // Gửi request tới backend FastAPI
    const res = await fetch('http://localhost:8000/upload-workout', {
      method: 'POST',
      body: formData,
    });

    // Đọc kết quả trả về dạng JSON
    const data = await res.json();

    // Xử lý kết quả
    if (data.result === 'REAL') {
      let html = `✅ Workout verified as REAL<br/>🔗 Tx Hash: <a href="https://sepolia.etherscan.io/tx/${data.tx_hash}" target="_blank">${data.tx_hash}</a>`;
      if (data.features) {
        html += `<div style="margin-top:1rem;"><b>Workout Details:</b><ul style="color:#333;background:#fafafa;border-radius:8px;padding:1rem;">`;
        for (const [key, value] of Object.entries(data.features)) {
          html += `<li><b>${key}:</b> ${value}</li>`;
        }
        html += `</ul></div>`;
      }
      resultDiv.innerHTML = html;
      const hashEl = document.querySelector('.character-card .hash');
      if (hashEl && data.tx_hash) hashEl.innerText = data.tx_hash.slice(0,6) + '...' + data.tx_hash.slice(-4);

      // Gửi lên smart contract
      sendRecordToContract(data.features);
    } else {
      resultDiv.innerText = '❌ Workout was marked as FAKE or invalid data.';
    }
  } catch (err) {
    resultDiv.innerText = '❌ Error uploading or backend not running.';
    console.error(err);
  }
}

// ====== HÀM GỬI RECORD LÊN SMART CONTRACT (ĐỂ NGOÀI CÙNG FILE) ======

async function sendRecordToContract(features) {
  try {
    if (!window.ethereum) {
      alert("Please install Metamask to continue!");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138"; // <-- Điền đúng địa chỉ contract
    const contractABI = [
      "function logActivity(string activityType, string details) public"
    ];
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const activityType = "workout";
    const details = JSON.stringify(features);

    const tx = await contract.logActivity(activityType, details);
    console.log("Transaction sent to blockchain:", tx.hash);

    await tx.wait();
    alert("Workout record successfully stored on blockchain!\nTx hash: " + tx.hash);

  } catch (err) {
    // Log toàn bộ object lỗi ra console (để inspect trong devtools)
    console.error("Full contract transaction error:", err);

    // Hiển thị ra popup đầy đủ thông tin nhất có thể
    let errorText = "Failed to send workout record to smart contract!\n\n";

    if (err && err.message) errorText += "Message: " + err.message + "\n\n";
    if (err && err.code) errorText += "Code: " + err.code + "\n\n";
    if (err && err.stack) errorText += "Stack:\n" + err.stack + "\n\n";
    if (err && err.reason) errorText += "Reason: " + err.reason + "\n\n";
    if (err && err.data) errorText += "Data: " + JSON.stringify(err.data) + "\n\n";
    if (typeof err === "object") errorText += "Full error JSON:\n" + JSON.stringify(err, null, 2);

    alert(errorText);
}
}
