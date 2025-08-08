document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("Form submitted");

  const fullName = document.getElementById("name").value;
  const dob = parseInt(document.getElementById("dob").value);
  const policyNumber = document.getElementById("policy-number").value;
  const insurerKey = document.getElementById("insurer").value.toLowerCase();

  const policyValueEth = document.getElementById("policy-value").value;

  // Validate ETH input before converting to wei
  if (isNaN(policyValueEth) || Number(policyValueEth) <= 0) {
    alert("Please enter a valid Policy Value in ETH");
    return;
  }

  const web3 = new Web3(window.ethereum);
  const policyValue = web3.utils.toWei(policyValueEth, "ether");

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

    // Simulate insurer validation (mock)
    const response = await fetch("assets/mock/insurer.json");
    const data = await response.json();
    const isValid = data.valid;

    if (isValid) {
      if (window.ethereum) {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0];
        console.log("MetaMask connected, account:", account);

        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

        // Check if contract is paused
        const paused = await contract.methods.paused().call();
        console.log("Paused state:", paused);
        if (paused) {
          alert("Contract is currently paused. Cannot register.");
          return;
        }

        // Register user
        await contract.methods.registerUser(
          fullName,
          dob,
          policyNumber,
          policyValue, // Already in wei
          insurerAddress
        ).send({ from: account });

        // Success message
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
