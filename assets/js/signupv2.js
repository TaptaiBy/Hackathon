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

  const policyValue = (Number(policyValueEth) * 1e18).toString(); // Convert ETH to wei

  try {
    // Load contract ABI and insurer mapping
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

    const CONTRACT_ADDRESS = "0xea5a13f401312eE5F3Ad06485E00ea0b7aC00CB8"; // HealthID contract
    const REWARD_POOL_ADDRESS = "0x37a79760bd8658e09c59fC880D3C94EC6807e844"; // RewardPoolManager

    const REWARD_POOL_ABI = [
      {
        "constant": true,
        "inputs": [{ "name": "insurer", "type": "address" }],
        "name": "insurers",
        "outputs": [
          { "name": "name", "type": "string" },
          { "name": "licenseInfo", "type": "string" },
          { "name": "isActive", "type": "bool" },
          { "name": "registeredAt", "type": "uint256" }
        ],
        "type": "function"
      }
    ];

    // Connect to MetaMask
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];
    console.log("MetaMask connected, account:", account);

    const web3 = new Web3(window.ethereum);

    // Validate insurer on-chain
    const rewardPool = new web3.eth.Contract(REWARD_POOL_ABI, REWARD_POOL_ADDRESS);
    const insurerData = await rewardPool.methods.insurers(insurerAddress).call();
    console.log("On-chain insurer data:", insurerData);

    if (!insurerData.isActive) {
      alert("This insurer is not active. Cannot proceed.");
      return;
    }

    // Connect to HealthID contract
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

  } catch (err) {
    console.error("Error during signup:", err);
    alert(`Something went wrong: ${err.message}`);
  }
});
