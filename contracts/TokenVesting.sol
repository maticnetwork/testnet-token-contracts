// pragma solidity >=0.4.22 <0.6.0;
pragma solidity >=0.5.2 <0.6.0;

import { Ownable } from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";


/**
 * @title TokenVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
 * owner.
 */
contract TokenVesting is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 private _token;
    uint256 public vestingId = 0;

    struct vesting {
        uint256 releaseTime;
        uint256 amount;
        address beneficiary;
        bool released;
    }
    mapping(uint256 => vesting) public vestings;

    event TokensReleased(address indexed beneficiary, uint256 indexed _vestingId, uint256 amount);
    event TokensVesting(address indexed beneficiary, uint256 indexed _vestingId, uint256 amount);

    constructor (IERC20 token) public {
        _token = token;
    }

    function token() public view returns (IERC20) {
        return _token;
    }

    function beneficiary(uint256 _vestingId) public view returns (address) {
        return vestings[_vestingId].beneficiary;
    }

    function releaseTime(uint256 _vestingId) public view returns (uint256) {
        return vestings[_vestingId].releaseTime;
    }

    function vestingAmount(uint256 _vestingId) public view returns (uint256) {
        return vestings[_vestingId].amount;
    }

    function addVesting(address _beneficiary, uint256 _releaseTime, uint256 _amount) public onlyOwner {
        vestingId = vestingId + 1;
        vestings[vestingId] = vesting({
            beneficiary: _beneficiary,
            releaseTime: _releaseTime,
            amount: _amount,
            released: false
        });
        emit TokensVesting(_beneficiary, vestingId, _amount);
    }

    function release(uint256 _vestingId) public {
        // solhint-disable-next-line not-rely-on-time
        require(vestings[_vestingId].beneficiary != address(0x0) && !vestings[_vestingId].released);
        require(block.timestamp >= vestings[_vestingId].releaseTime);

        require(_token.balanceOf(address(this)) > 0);
        vestings[_vestingId].released = true;
        _token.safeTransfer(vestings[_vestingId].beneficiary, vestings[_vestingId].amount);
        emit TokensReleased(vestings[_vestingId].beneficiary,_vestingId, vestings[_vestingId].amount);
    }
}
