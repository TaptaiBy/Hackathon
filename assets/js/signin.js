import { getContract, getProviderAndSigner } from "contracts/index.js";

document.getElementById("connectBtn").addEventListener("click", async () => {
  const status = document.getElementById("status");

  try {
    const { signer } = await getProviderAndSigner();
    const userAddress = await signer.getAddress();

    const healthID = await getContract("HealthID");
    const tokenId = await healthID.tokenOf(userAddress);

    if (tokenId.toString() !== "0") {
      status.textContent = `✅ Access granted. HealthID #${tokenId}`;
      localStorage.setItem("userAddress", userAddress);
      localStorage.setItem("healthID", tokenId.toString());
      setTimeout(() => window.location.href = "dashboard.html", 1000);
    } else {
      status.textContent = "❌ Access denied: No HealthID found.";
    }
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Login failed. Check wallet or contract.";
  }
});
