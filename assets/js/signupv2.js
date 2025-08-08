document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("Form submitted");

  const fullName = document.getElementById("name").value;
  const dob = new Date(document.getElementById("dob").value).getTime(); // convert to timestamp
  const policyNumber = document.getElementById("policy-number").value;
  const insurerKey = document.getElementById("insurer").value.toLowerCase();
  const policyValueEth = document.getElementById("policy-value").value;

  if (isNaN(policyValueEth) || Number(policyValueEth) <= 0) {
    alert("Please enter a valid Policy Value in ETH");
    return;
  }

  const policyValue = (Number(policyValueEth) * 1e18).toString();

  // Embedded insurer address map
  const insurerMap = {
    "aia": "0x1234567890abcdef1234567890abcdef12345678",
    "prudential": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "metlife": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
  };

  const insurerAddress = insurerMap[insurerKey];
  if (!insurerAddress) {
    alert("Selected insurer not registered.");
    return;
  }

  const HEALTHID_ADDRESS = "0xea5a13f401312eE5F3Ad06485E00ea0b7aC00CB8";
  const RPM_ADDRESS = "0x37a79760bd8658e09c59fC880D3C94EC6807e844";

  const HEALTHID_ABI = [
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
      "outputs": [
        {
          "internalType": "contract IRewardPoolManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const RPM_ABI = [
    {
      "inputs": [{ "internalType": "address", "name": "insurer", "type": "address" }],
      "name": "getInsurerProfile",
      "outputs": [
        { "internalType": "string", "name": "name", "type": "string" },
        { "internalType": "string", "name": "licenseInfo", "type": "string" },
        { "internalType": "bool", "name": "isActive", "type": "bool" },
        { "internalType": "uint256", "name": "registeredAt", "type": "uint256" },
        { "internalType": "uint256", "name": "balance", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }

    const web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];

    const healthID = new web3.eth.Contract(HEALTHID_ABI, HEALTHID_ADDRESS);
    const rewardPool = new web3.eth.Contract(RPM_ABI, RPM_ADDRESS);

    // Validate insurer on-chain
    const profile = await rewardPool.methods.getInsurerProfile(insurerAddress).call();
    console.log("On-chain insurer profile:", profile);
    if (!profile.isActive) {
      alert("This insurer is not active. Cannot proceed.");
      return;
    }

    // Check if contract is paused
    const paused = await healthID.methods.paused().call();
    if (paused) {
      alert("HealthID contract is currently paused.");
      return;
    }

    // Call registerUser
    await healthID.methods.registerUser(
      fullName,
      dob,
      policyNumber,
      policyValue,
      insurerAddress
    ).send({ from: account });

    Swal.fire({
      icon: "success",
      title: "Registered!",
      text: "Redirecting to login...",
      showConfirmButton: false,
      timer: 2000,
      position: "center",
      timerProgressBar: true,
      didClose: () => {
        window.location.href = "signinv2.html";
      }
    });

  } catch (err) {
    console.error("Error during registration:", err);
    if (err?.data?.message) {
      alert("Revert reason: " + err.data.message);
    } else {
      alert("Transaction failed. See console for more info.");
    }
  }
});
document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("Form submitted");

  const fullName = document.getElementById("name").value;
  const dob = new Date(document.getElementById("dob").value).getTime(); // convert to timestamp
  const policyNumber = document.getElementById("policy-number").value;
  const insurerKey = document.getElementById("insurer").value.toLowerCase();
  const policyValueEth = document.getElementById("policy-value").value;

  if (isNaN(policyValueEth) || Number(policyValueEth) <= 0) {
    alert("Please enter a valid Policy Value in ETH");
    return;
  }

  const policyValue = (Number(policyValueEth) * 1e18).toString();

  // Embedded insurer address map
  const insurerMap = {
    "AIA": "0xe0CB133a21D7BFf21C2F4600015d29096C5B754B",
    "prudential": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "metlife": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
  };

  const insurerAddress = insurerMap[insurerKey];
  if (!insurerAddress) {
    alert("Selected insurer not registered.");
    return;
  }

  const HEALTHID_ADDRESS = "0xea5a13f401312eE5F3Ad06485E00ea0b7aC00CB8";
  const RPM_ADDRESS = "0x37a79760bd8658e09c59fC880D3C94EC6807e844";

  const HEALTHID_ABI = [
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
      "outputs": [
        {
          "internalType": "contract IRewardPoolManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const RPM_ABI = [
    {
      "inputs": [{ "internalType": "address", "name": "insurer", "type": "address" }],
      "name": "getInsurerProfile",
      "outputs": [
        { "internalType": "string", "name": "name", "type": "string" },
        { "internalType": "string", "name": "licenseInfo", "type": "string" },
        { "internalType": "bool", "name": "isActive", "type": "bool" },
        { "internalType": "uint256", "name": "registeredAt", "type": "uint256" },
        { "internalType": "uint256", "name": "balance", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }

    const web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];

    const healthID = new web3.eth.Contract(HEALTHID_ABI, HEALTHID_ADDRESS);
    const rewardPool = new web3.eth.Contract(RPM_ABI, RPM_ADDRESS);

    // Validate insurer on-chain
    const profile = await rewardPool.methods.getInsurerProfile(insurerAddress).call();
    console.log("On-chain insurer profile:", profile);
    if (!profile.isActive) {
      alert("This insurer is not active. Cannot proceed.");
      return;
    }

    // Check if contract is paused
    const paused = await healthID.methods.paused().call();
    if (paused) {
      alert("HealthID contract is currently paused.");
      return;
    }

    // Call registerUser
    await healthID.methods.registerUser(
      fullName,
      dob,
      policyNumber,
      policyValue,
      insurerAddress
    ).send({ from: account });

    Swal.fire({
      icon: "success",
      title: "Registered!",
      text: "Redirecting to login...",
      showConfirmButton: false,
      timer: 2000,
      position: "center",
      timerProgressBar: true,
      didClose: () => {
        window.location.href = "signinv2.html";
      }
    });

  } catch (err) {
    console.error("Error during registration:", err);
    if (err?.data?.message) {
      alert("Revert reason: " + err.data.message);
    } else {
      alert("Transaction failed. See console for more info.");
    }
  }
});
