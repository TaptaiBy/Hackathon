document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const fullName = document.getElementById("name").value;
  const dobString = document.getElementById("dob").value;
  const dob = new Date(dobString).getTime() / 1000;

  const policyNumber = document.getElementById("policy-number").value;
  const insurerKey = document.getElementById("insurer").value.toLowerCase();
  const policyValueEth = document.getElementById("policy-value").value;

  if (isNaN(policyValueEth) || Number(policyValueEth) <= 0) {
    alert("Please enter a valid Policy Value in ETH");
    return;
  }

  const policyValue = (Number(policyValueEth) * 1e18).toString(); // ETH to wei

  try {
    // Embedded ABI for HealthID
    const CONTRACT_ABI = [
      {
        "inputs": [{ "internalType": "address", "name": "_rewardPoolManager", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }],
        "name": "UserBurned",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
          { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
          { "indexed": false, "internalType": "address", "name": "insurer", "type": "address" },
          { "indexed": false, "internalType": "uint256", "name": "contractValue", "type": "uint256" }
        ],
        "name": "UserRegistered",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "burnHealthID",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
        "name": "getUserInsurer",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
        "name": "getUserInsurerInfo",
        "outputs": [
          { "internalType": "string", "name": "insurerName", "type": "string" },
          { "internalType": "address", "name": "insurerAddress", "type": "address" },
          { "internalType": "string", "name": "licenseInfo", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "uint256", "name": "dob", "type": "uint256" },
          { "internalType": "string", "name": "policyNo", "type": "string" },
          { "internalType": "uint256", "name": "contractValue", "type": "uint256" },
          { "internalType": "address", "name": "insurer", "type": "address" }
        ],
        "name": "registerUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rewardPoolManager",
        "outputs": [{ "internalType": "contract IRewardPoolManager", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "users",
        "outputs": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "uint256", "name": "dob", "type": "uint256" },
          { "internalType": "string", "name": "policyNo", "type": "string" },
          { "internalType": "uint256", "name": "contractValue", "type": "uint256" },
          { "internalType": "address", "name": "insurer", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    // Load insurer map
    const insurersResponse = await fetch("assets/data/registered_insurers.json");
    const insurerMap = await insurersResponse.json();

    const insurerAddress = insurerMap[insurerKey];
    if (!insurerAddress) {
      alert("Selected insurer not registered.");
      return;
    }

    const CONTRACT_ADDRESS = "0xea5a13f401312eE5F3Ad06485E00ea0b7aC00CB8";
    const REWARD_POOL_ADDRESS = "0x37a79760bd8658e09c59fC880D3C94EC6807e844";

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

    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];
    const web3 = new Web3(window.ethereum);

    const rewardPool = new web3.eth.Contract(REWARD_POOL_ABI, REWARD_POOL_ADDRESS);
    const profile = await rewardPool.methods.getInsurerProfile(insurerAddress).call();

    if (!profile.isActive) {
      alert("This insurer is not active.");
      return;
    }

    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    await contract.methods
      .registerUser(fullName, dob, policyNumber, policyValue, insurerAddress)
      .send({ from: account });

    Swal.fire({
      icon: 'success',
      title: 'Registration successful!',
      text: 'Redirecting to sign in...',
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
      didClose: () => {
        window.location.href = "signinv2.html";
      }
    });

  } catch (err) {
    console.error("Contract reverted:", err);

    let revertReason = "Execution reverted. See console for details.";
    if (err?.data) {
      const reasonMatch = Object.values(err.data).find(v => v?.reason);
      if (reasonMatch) {
        revertReason = "Revert reason: " + reasonMatch.reason;
      }
    }

    alert(revertReason);
  }
});
