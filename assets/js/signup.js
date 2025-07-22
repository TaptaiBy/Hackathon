// Map insurer names to their Ethereum wallet addresses
const insurerAddresses = {
  aia: "0x1234567890abcdef1234567890abcdef12345678",
  prudential: "0xabcd1234567890abcdef1234567890abcdef1234",
  metlife: "0x9876543210abcdef9876543210abcdef98765432"
};

document.getElementById("signupForm").addEventListener("submit", async function (event) {event.preventDefault();
  console.log("Form submitted");
  const fullName = document.getElementById("name").value;
  const dob = document.getElementById("dob").value;
  const policyNumber = document.getElementById("policy-number").value;
  const policyValue = document.getElementById("policy-value").value;
  const insurerKey = document.getElementById("insurer").value.toLowerCase();
  const insurerAddress = insurerAddresses[insurerKey];

// Validate insurer selection
if (!insurerKey || !insurerAddresses[insurerKey]) {
  alert("Please select a valid insurer");
  return;
  }
console.log(`Selected insurer: ${insurerKey}, Wallet: ${insurerAddress}`);

// Validate policy value
  const policyValue = parseInt(policyValueInput, 10);
  if (isNaN(policyValue)) {
    alert("Please enter a valid Policy Value (number)");
    return;
  }
  const abiResponse = await fetch("assets/contracts/HealthID.json");
  const CONTRACT_ABI = await abiResponse.json();
  const CONTRACT_ADDRESS = "0x60c928ea4f6f73e129f0a9c2d940bc3dbb721250";

  // 1. Simulate insurer validation (mock)
  const response = await fetch("assets/mock/insurer.json");
  const data = await response.json();
  const isValid = data.valid;

  // 2. If valid, connect MetaMask & interact with smart contract
  if (isValid) {
    if (window.ethereum) {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];

      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      await contract.methods.mintHealthID(account,fullName,dob,policyNumber,parseInt(policyValue),insurerAddress,"https://example.com/metadata.json").send({ from: account });

      alert("HealthID created successfully!");
    } else {
      alert("Please install MetaMask");
    }
  } else {
    alert("Policy validation failed. Cannot proceed.");
  }
});
