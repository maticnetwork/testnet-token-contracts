pragma solidity ^0.4.24;

import "./ERC20.sol";
import "./TokenVesting.sol";

/**
 * @title ERC20Detailed token
 * @dev The decimals are only for visualization purposes.
 * All the operations are done using the smallest and indivisible token unit,
 * just as on Ethereum all the operations are done in wei.
 */
contract Token is ERC20 {

    constructor (string name, string symbol, uint8 decimals, uint256 totalSupply)
    public
    ERC20 (name, symbol, decimals, totalSupply) {
        _balances[msg.sender] = totalSupply * (10 ** decimals);

        // TODO: Add vesting schedule
        // new TokenVesting(beneficiary, start, cliffDuration, duration);
    }

}
