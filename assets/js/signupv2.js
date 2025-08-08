document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("Form submitted");
  
  const fullName = document.getElementById("name").value;
  const dob = parseInt(document.getElementById("dob").value);
  const policyNumber = document.getElementById("policy-number").value;
  const web3 = new Web3(window.ethereum); // Make sure this is declared before using it
  const policyValue = document.getElementById("policy-value").value;
  const policyValue = web3.utils.toWei(policyValueEth, "ether");

  const insurerKey = document.getElementById("insurer").value.toLowerCase();

  // Validate policy value
  if (isNaN(policyValue)) {
    alert("Please enter a valid Policy Value (number)");
    return;
  }
  
  try {
    // Load ABI and registered insurers
    const [abiResponse, insurersResponse] = await Promise.all([
      fetch("contracts/HealthIDv2.json"),
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
    const CONTRACT_ADDRESS = "0xe0CB133a21D7BFf21C2F4600015d29096C5B754B";

    // 1. Simulate insurer validation (mock)
    const response = await fetch("assets/mock/insurer.json");
    const data = await response.json();
    const isValid = data.valid;
  
    // 2. If valid, connect MetaMask & interact with smart contract
    if (isValid) {
      if (window.ethereum) {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0];
        console.log("MetaMask connected, account:", account);
  
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  
        // --- Debug checks before minting ---
        const paused = await contract.methods.paused().call();
        console.log("Paused state:", paused);
        if (paused) {
          alert("Contract is currently paused. Cannot mint.");
          return;
        }
            
        await contract.methods.registerUser(
        fullName,
        parseInt(dob),
        policyNumber,
        parseInt(policyValue),
        insurerAddress
        ).send({ from: account });

        
        Swal.fire({
          icon: 'success',
          title: 'Registered!',
          text: 'Redirecting to login...',
          showConfirmButton: false,
          timer: 2000,
          position: 'center',
          timerProgressBar: true,
          didClose: () => {
            window.location.href = 'signinv2.html';
          }
        });
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
