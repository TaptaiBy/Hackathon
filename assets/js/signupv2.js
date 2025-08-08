document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("Form submitted");

  const fullName = document.getElementById("name").value;
  const dob = new Date(document.getElementById("dob").value).getTime();
  const policyNumber = document.getElementById("policy-number").value;
  const insurerKey = document.getElementById("insurer").value.toLowerCase();
  const policyValueEth = document.getElementById("policy-value").value;

  if (isNaN(policyValueEth) || Number(policyValueEth) <= 0) {
    alert("Please enter a valid Policy Value in ETH");
    return;
  }

  const policyValue = (Number(policyValueEth) * 1e18).toString();

  // ✅ Hardcoded insurer addresses
  const insurerMap = {
    "aia": "0xe0CB133a21D7BFf21C2F4600015d29096C5B754B",
    "prudential": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "metlife": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
  };

  const insurerAddress = insurerMap[insurerKey];
  if (!insurerAddress) {
    alert("Selected insurer not registered.");
    return;
  }

  // ✅ Minimal ABI for only registerUser
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
    }
  ];

  const HEALTHID_ADDRESS = "0xea5a13f401312eE5F3Ad06485E00ea0b7aC00CB8";

  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }

    const web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];

    const healthID = new web3.eth.Contract(HEALTHID_ABI, HEALTHID_ADDRESS);

    // ✅ Call registerUser directly
    await healthID.methods.registerUser(
      fullName,
      dob,
      policyNumber,
      policyValue,
      insurerAddress
    ).send({ from: account });

    // ✅ Show success popup and redirect
    Swal.fire({
      icon: "success",
      title: "Registered!",
      text: "Redirecting to login...",
      showConfirmButton: false,
      timer: 2000,
      position: "center",
      timerProgressBar: true,
      didClose: () => {
        window.location.href = "signin.html";
      }
    });

  } catch (error) {
    console.error("Registration failed:", error);
    alert("Registration failed. See console for details.");
  }

}); // 👈 You were missing this closing bracket!
