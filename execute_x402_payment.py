import urllib.request
import json
import base64
import time
from web3 import Web3

# ERC-20 transfer ABI snippet
erc20_abi = [
    {
        "constant": False,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": False,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

# Load wallet credentials
with open('/Users/huda/.hermes/cdp_wallet.json') as f:
    wallet = json.load(f)

private_key = wallet['private_key']
address = wallet['address']

# Initialize web3 on Base Mainnet
w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org', request_kwargs={'headers': {'User-Agent': 'Mozilla'}}))

# 1. Trigger the resource server to get the payment requirement
print("1. Sending initial request to trigger 402...")
trigger_url = 'https://x402.tanship.dev/v1/ai/chat'
chat_payload = {"messages": [{"role": "user", "content": "hi"}]}

req = urllib.request.Request(
    trigger_url,
    data=json.dumps(chat_payload).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla'
    },
    method='POST'
)

payment_required_header = None
try:
    with urllib.request.urlopen(req) as resp:
        pass
except urllib.error.HTTPError as e:
    if e.code == 402:
        # Check PAYMENT-REQUIRED header
        payment_required_header = e.headers.get('payment-required')
        if not payment_required_header:
            # Fallback to case insensitive check
            for k, v in e.headers.items():
                if k.lower() == 'payment-required':
                    payment_required_header = v
                    break

if not payment_required_header:
    print("Error: Could not get payment-required header!")
    exit(1)

print("Received PAYMENT-REQUIRED header!")

# 2. Decode the PAYMENT-REQUIRED header
decoded_pr = json.loads(base64.b64decode(payment_required_header).decode('utf-8'))
print("Decoded PaymentRequired:")
print(json.dumps(decoded_pr, indent=2))

accepts = decoded_pr['accepts'][0]
target_pay_to = w3.to_checksum_address(accepts['payTo'])
target_amount = int(accepts['amount'])
target_asset = w3.to_checksum_address(accepts['asset'])
target_network = accepts['network']

print(f"\nPayment requirements: Network: {target_network}, Asset: {target_asset}, PayTo: {target_pay_to}, Amount: {target_amount}")

# 3. Construct and send the ERC-20 USDC transfer on Base Mainnet
print("\n3. Sending ERC-20 transfer transaction...")
token_contract = w3.eth.contract(address=target_asset, abi=erc20_abi)
nonce = w3.eth.get_transaction_count(address)

tx = token_contract.functions.transfer(target_pay_to, target_amount).build_transaction({
    'chainId': 8453,
    'gas': 80000,
    'gasPrice': int(w3.eth.gas_price * 1.2),
    'nonce': nonce
})

tx['from'] = address

signed_tx = w3.eth.account.sign_transaction(tx, private_key)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction).hex()
print(f"Transaction Hash: {tx_hash}")

print("Waiting for transaction confirmation...")
receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
print(f"Receipt Status: {receipt.status}")
if receipt.status != 1:
    print("Transaction failed!")
    exit(1)

# 4. Construct PaymentPayload
payment_payload = {
    "x402Version": 2,
    "resource": decoded_pr.get('resource'),
    "accepted": accepts,
    "payload": {
        "transaction": tx_hash,
        "payer": address,
        "network": target_network,
        "amount": str(target_amount)
    },
    "extensions": {}
}

# 5. Base64-encode the PaymentPayload
payment_signature = base64.b64encode(json.dumps(payment_payload).encode('utf-8')).decode('utf-8')

# 6. Retry the original request with PAYMENT-SIGNATURE
print("\n6. Retrying request with PAYMENT-SIGNATURE header...")
retry_req = urllib.request.Request(
    trigger_url,
    data=json.dumps(chat_payload).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla',
        'PAYMENT-SIGNATURE': payment_signature
    },
    method='POST'
)

try:
    with urllib.request.urlopen(retry_req) as resp:
        print(f"Success! Status Code: {resp.status}")
        print("Response Headers:")
        print(dict(resp.headers))
        print("Response Body:")
        print(resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
