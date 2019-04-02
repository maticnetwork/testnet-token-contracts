## Matic (MATIC) testnet token contracts

Details:  
Name: Testnet Matic  
Symbol: MATIC
Decimals: 18  
Total Supply: 10,000,000,000

The contracts are created with the OpenZeppelin library v2.0. The token is a standard ERC20 token implementing the IERC20 interface.

```
/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
  interface IERC20 {
  function totalSupply() external view returns (uint256);

      function balanceOf(address who) external view returns (uint256);

      function allowance(address owner, address spender) external view returns (uint256);

      function transfer(address to, uint256 value) external returns (bool);

      function approve(address spender, uint256 value) external returns (bool);

      function transferFrom(address from, address to, uint256 value) external returns (bool);

      event Transfer(address indexed from, address indexed to, uint256 value);

      event Approval(address indexed owner, address indexed spender, uint256 value);

  }
```
