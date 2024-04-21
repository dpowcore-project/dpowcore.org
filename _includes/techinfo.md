{% capture /dev/null %}
{% endcapture %}

| Name | Description |
|-----------------------------|--------------------------------------------|
| Coin Name                   | <code>Dpowcoin</code> |
| Short Name                  | <code>DPC</code> |
| Block Time                  | <code>5m or 300s</code> |
| Diff Retargeting            | <code>LWMA3 with N 576</code> |
| Reward                      | <code>50 coins</code> |
| Subsidy Halving Interval    | <code>Every 420 000 blocks</code> |
| Proof Type                  | <code>Dual POW ( not multi pow!)</code> |
| Algo                        | <code>Dual POW - by Yespower and  Argon2id 0x13 + SHA512</code> |
| POW check like at LTC       | <code>Using sha256d in headers indexing</code>
| Legacy Address Prefix       | <code>P - 55 - 0x37 </code> |
| P2SH-SegWit Address Prefix  | <code>C - 28 - 0x1c </code> |
| Bech32-SegWit Prefix        | <code>dpc1</code> |
| Default p2p port            | <code>42003</code> |
| Default rpc port            | <code>42002</code> |
| powLimit                    | <code>001fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff</code> |
| BIPs activated              | <code>Block 2<code>|
| Network Magic               | <code>0xf29f4afb</code> |
| bip324 Salt                 | <code>dpowcoin_v2_shared_secret</code> |
| COINBASE MATURITY           | <code>100</code> |
| MAX SUPPLY                  | <code>42 000 000</code> |
| Pre Mine                    | <code>None if not count 3 blocks for activate "BIP" rules.</code> |
| Dev Fees                    | <code>None </code> |

How to mine ?

go to debug console and put command

<code>generatetoaddress nblocks "address" ( maxtries )</code>

Example for infine try

<code>generatetoaddress 10000 "Myaddress" -1</code>

nblocks must be positive value!