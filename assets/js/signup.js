document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log("Form submitted"); 

  const fullName = document.getElementById("name").value;
  const idNumber = document.getElementById("id").value;
  const dob = document.getElementById("dob").value;
  const device = document.getElementById("device").value;
  const insurer = document.getElementById("insurer").value;
  const policyNumber = document.getElementById("policy-number").value;
  const policyValue = document.getElementById("policy-value").value.toString;
  const CONTRACT_ABI = [
	{
		"inputs": [],
		"name": "latestRoundData",
		"outputs": [
			{
				"internalType": "uint80",
				"name": "roundId",
				"type": "uint80"
			},
			{
				"internalType": "int256",
				"name": "price",
				"type": "int256"
			},
			{
				"internalType": "uint256",
				"name": "startedAt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "updatedAt",
				"type": "uint256"
			},
			{
				"internalType": "uint80",
				"name": "answeredInRound",
				"type": "uint80"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
  const CONTRACT_ADDRESS = "0x9948f5e63cc55adeafe5259135e2c8623511501a";

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

      await contract.methods.MINTHEALTHID(account,fullName,dob,policyNumber,parseInt(policyValue),"0x0000000000000000000000000000000000000000","https://example.com/metadata.json").send({ from: account });

      alert("HealthID created successfully!");
    } else {
      alert("Please install MetaMask");
    }
  } else {
    alert("Policy validation failed. Cannot proceed.");
  }
});
