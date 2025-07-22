import { getContract, getProviderAndSigner } from "contracts/index.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM loaded");

  const connectBtn = document.getElementById("connectBtn");
  const status = document.getElementById("status");

  if (!connectBtn) {
    console.error("❌ Connect button not found in DOM");
    return;
  }

  connectBtn.addEventListener("click", async () => {
    console.log("🟢 Connect button clicked");

    try {
      const { signer } = await getProviderAndSigner();
      console.log("🔐 Wallet connected");

      const userAddress = await signer.getAddress();
      console.log("👤 User address:", userAddress);

      const healthID = await getContract("HealthID");
      console.log("📄 Contract loaded:", healthID.address);

      const tokenId = await healthID.tokenOf(userAddress);
      console.log("📛 HealthID token:", tokenId.toString());

      if (tokenId.toString() !== "0") {
        status.textContent = `✅ Access granted. HealthID #${tokenId}`;
        localStorage.setItem("userAddress", userAddress);
        localStorage.setItem("healthID", tokenId.toString());
        setTimeout(() => window.location.href = "dashboard.html", 1000);
      } else {
        status.textContent = "❌ Access denied: No HealthID found.";
      }
    } catch (err) {
      console.error("❌ Error during sign-in:", err);
      status.textContent = "❌ Login failed. Check wallet or contract.";
    }
  });
});
