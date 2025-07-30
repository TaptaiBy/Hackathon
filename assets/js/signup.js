document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("Form submitted");
  
  const fullName = document.getElementById("name").value;
  const dob = document.getElementById("dob").value;
  const policyNumber = document.getElementById("policy-number").value;
  const policyValue = parseInt(document.getElementById("policy-value").value, 10);
  const insurerKey = document.getElementById("insurer").value.toLowerCase();

  // Validate policy value
  if (isNaN(policyValue)) {
    alert("Please enter a valid Policy Value (number)");
    return;
  }
  
  try {
    // Load ABI and registered insurers
    const [abiResponse, insurersResponse] = await Promise.all([
      fetch("contracts/HealthID.json"),
      fetch("assets/data/registered_insurers.json")
    ]);
    const CONTRACT_ABI = await abiResponse.json();
    const insurerAddresses = await insurersResponse.json();

    const insurerAddress = insurerAddresses[insurerKey];
    if (!insurerAddress) {
      alert("Selected insurer not registered.");
      return;
    }
    console.log(`Selected Insurer: ${insurerKey}, Wallet: ${insurerAddress}`);
    const CONTRACT_ADDRESS = "0x85b214a4C577a3D8A0023E5808e4d672eBe96268";

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
  
        await contract.methods.mintHealthID(
          account,
          fullName,
          dob,
          policyNumber,
          parseInt(policyValue),
          insurerAddress
        ).send({ from: account });
  
        alert("HealthID created successfully!");
      } else {
        alert("Please install MetaMask");
      }
    } else {
      alert("Policy validation failed. Cannot proceed.");
    }
  } catch (err) {
  console.error("Error during signup:", err);
  alert(`Something went wrong: ${err.message}`);
}
});
