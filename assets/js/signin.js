document.getElementById("connectBtn").addEventListener("click", async () => {
  const status = document.getElementById("status");

  try {
    const CONTRACT_ADDRESS = "0x60c928ea4f6f73e129f0a9c2d940bc3dbb721250";

    // ✅ Load ABI manually
    const response = await fetch("contracts/HealthID.json");
    const CONTRACT_ABI = await response.json();

    // ✅ Check MetaMask
    if (!window.ethereum) {
      status.textContent = "❌ Please install MetaMask.";
      return;
    }

    // ✅ Connect wallet
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    // ✅ Interact with contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const tokenId = await contract.tokenOf(userAddress);

    if (tokenId.toString() !== "0") {
      status.textContent = `✅ Access granted. HealthID #${tokenId}`;
      localStorage.setItem("userAddress", userAddress);
      localStorage.setItem("healthID", tokenId.toString());
      setTimeout(() => window.location.href = "dashboard.html", 1000);
    } else {
      status.textContent = "❌ No HealthID NFT found. Please sign up first.";
    }

  } catch (err) {
    console.error("Login error:", err);
    status.textContent = `❌ Login failed: ${err.message}`;
  }
});
