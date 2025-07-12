document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log("Form submitted"); 

  const fullName = document.getElementById("name").value;
  const idNumber = document.getElementById("id").value;
  const dob = document.getElementById("dob").value;
  const device = document.getElementById("device").value;
  const insurer = document.getElementById("insurer").value;
  const policyNumber = document.getElementById("policy-number").value;
  const policyValue = document.getElementById("policy-value").value;

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

      await contract.methods.createHealthID(account, policyNumber, insurer).send({ from: account });

      alert("HealthID created successfully!");
    } else {
      alert("Please install MetaMask");
    }
  } else {
    alert("Policy validation failed. Cannot proceed.");
  }
});
