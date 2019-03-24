// pragma solidity >=0.4.22 <0.6.0;
pragma solidity >=0.5.2 <0.6.0;

import { ERC20 } from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import { ERC20Detailed } from "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

// import "./TokenVesting.sol";


contract Token is ERC20, ERC20Detailed {
    constructor (string memory name, string memory symbol, uint8 decimals, uint256 totalSupply)
    public
    ERC20Detailed (name, symbol, decimals) { 
        _mint(msg.sender, totalSupply);
        // vesting Example
        // address tokenVesting = new TokenVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, 1552314037, 10, 2);
        // _transfer(msg.sender, 0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, 100);
    }
}
