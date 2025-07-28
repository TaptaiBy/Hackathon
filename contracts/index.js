(async () => {
  if (!window.ethers) {
    console.error("Ethers not loaded.");
    return;
  }

  const addresses = {
    ActivityLogger: "0x4e76CB15C8A88a47e5210bf4b1ECE6A9036894ef",
    HealthID: "0x60c928ea4f6f73e129f0a9c2d940bc3dbb721250",
    PriceOracle: "0xfda8f534cc264f711b56975065338e3605b08dc8",
    RewardEngine: "0xfd7877b7c1fd6ef4250b0bb5e4a83c4b65bc0905",
    RPM: "0x18389e0e5c069a5d1f77bd20899510e31fcfdd8c",
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
