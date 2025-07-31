(async () => {
  if (!window.ethers) {
    console.error("Ethers not loaded.");
    return;
  }

  const addresses = {
    ActivityLogger: "0x29894b9D2a47AE7e580e0b893efF98a0BbE3a56B",
    HealthID: "0xB17c14EA002510d1541396F62E81b086f134c942",
    PriceOracle: "0x119Ae6648d91363033CC1ba8f4e989FB1Ba4eE01",
    RewardEngine: "0x6EC048aF1248be522241B21dfC38130531E4f3A1",
    RPM: "0x881d0741DE260f499C71e7F889698F4D25e2e090",
  };

  const loadABI = async (path) => {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return await res.json();
  };

  const abis = {
    ActivityLogger: await loadABI("/contracts/ActivityLogger.json"),
    HealthID: await loadABI("/contracts/HealthID.json"),
    PriceOracle: await loadABI("/contracts/PriceOracle.json"),
    RewardEngine: await loadABI("/contracts/RewardEngine.json"),
    RPM: await loadABI("/contracts/RewardPoolManager.json"),
  };

  window.getContract = async function (name) {
    if (!window.ethereum) {
      throw new Error("MetaMask not available");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    if (!abis[name] || !addresses[name]) {
      throw new Error(`Unknown contract name: ${name}`);
    }

    return new ethers.Contract(addresses[name], abis[name], signer);
  };
})();
