document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("Form submitted");

  const fullName = document.getElementById("name").value;
  const dobStr = document.getElementById("dob").value;
  const policyNumber = document.getElementById("policy-number").value;
  const insurerKey = document.getElementById("insurer").value.toLowerCase();
  const policyValueEth = document.getElementById("policy-value").value;

  if (!fullName || !dobStr || !policyNumber || !insurerKey || !policyValueEth) {
    alert("Please fill in all fields.");
    return;
  }

  const dob = Math.floor(new Date(dobStr).getTime() / 1000); // Convert DOB to UNIX timestamp

  if (isNaN(policyValueEth) || Number(policyValueEth) <= 0) {
    alert("Please enter a valid Policy Value in ETH");
    return;
  }

  const policyValue = (Number(policyValueEth) * 1e18).toString();

  const CONTRACT_ADDRESS = "0xea5a13f401312eE5F3Ad06485E00ea0b7aC00CB8";
  const REWARD_POOL_ADDRESS = "0x37a79760bd8658e09c59fC880D3C94EC6807e844";

  try {
    // Connect to wallet
    if (!window.ethereum) {
      alert("Please install MetaMask to proceed.");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];
    const web3 = new Web3(window.ethereum);

    // Load ABI files
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

    // Use getInsurerProfile to validate
    const REWARD_POOL_ABI = [
      {
        "constant": true,
        "inputs": [{ "name": "insurer", "type": "address" }],
        "name": "getInsurerProfile",
        "outputs": [
          { "name": "name", "type": "string" },
          { "name": "licenseInfo", "type": "string" },
          { "name": "isActive", "type": "bool" },
          { "name": "registeredAt", "type": "uint256" },
          { "name": "balance", "type": "uint256" }
        ],
        "type": "function",
        "stateMutability": "view"
      }
    ];

    const rewardPool = new web3.eth.Contract(REWARD_POOL_ABI, REWARD_POOL_ADDRESS);
    const insurerData = await rewardPool.methods.getInsurerProfile(insurerAddress).call();

    console.log("Insurer profile:", insurerData);

    if (!insurerData.isActive) {
      alert("Selected insurer is not active.");
      return;
    }

    // Load HealthID contract
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    const isPaused = await contract.methods.paused().call();
    if (isPaused) {
      alert("Contract is currently paused. Please try again later.");
      return;
    }

    // Check if user is already registered
    const userData = await contract.methods.users(account).call();
    if (userData.user !== "0x0000000000000000000000000000000000000000") {
      alert("This wallet is already registered.");
      return;
    }

    // Submit registration
    await contract.methods.registerUser(
      fullName,
      dob,
      policyNumber,
      policyValue,
      insurerAddress
    ).send({ from: account });

    // Success
    Swal.fire({
      icon: 'success',
      title: 'Registration Successful!',
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
    const revertReason = err?.data?.message || err?.message || "Unknown error";
    Swal.fire({
      icon: 'error',
      title: 'Signup Failed',
      text: revertReason
    });
  }
});
