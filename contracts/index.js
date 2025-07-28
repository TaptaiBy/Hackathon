// /contracts/index.js

(async () => {
  const { ethers } = window;

  const addresses = {
    ActivityLogger: "0x4e76CB15C8A88a47e5210bf4b1ECE6A9036894ef",
    HealthID: "0x60c928ea4f6f73e129f0a9c2d940bc3dbb721250",
    PriceOracle: "0xfda8f534cc264f711b56975065338e3605b08dc8",
    RewardEngine: "0xfd7877b7c1fd6ef4250b0bb5e4a83c4b65bc0905",
    RPM: "0x18389e0e5c069a5d1f77bd20899510e31fcfdd8c",
  };

  const abis = {
    ActivityLogger: await (await fetch("/contracts/ActivityLogger.json")).json(),
    HealthID: await (await fetch("/contracts/HealthID.json")).json(),
    PriceOracle: await (await fetch("/contracts/PriceOracle.json")).json(),
    RewardEngine: await (await fetch("/contracts/RewardEngine.json")).json(),
    RPM: await (await fetch("/contracts/RewardPoolManager.json")).json(),
  };

  window.getContract = async function (name) {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask not found");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    if (!addresses[name] || !abis[name]) {
      throw new Error(`Unknown contract: ${name}`);
    }

    return new ethers.Contract(addresses[name], abis[name], signer);
  };
})();
