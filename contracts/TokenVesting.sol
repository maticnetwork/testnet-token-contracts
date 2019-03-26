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
    uint256 internal vestingId = 0;

    struct vesting {
        address beneficiary;
        uint256 releaseTime;
        uint256 amount;
    }
    mapping(uint256 => vesting) public vestings;

    event TokensReleased(address beneficiary, uint256 amount);
    event TokensVesting(address beneficiary, uint256 amount);

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

    function addVesting(address _beneficiary, uint256 _releaseTime, uint256 _amount) public { // onlyOwner
        _vestingId = _vestingId + 1;
        _token.safeTransferFrom(_beneficiary, address(this), _amount);
        vestings[_vestingId] = vesting({
            beneficiary: _beneficiary,
            releaseTime: _releaseTime,
            amount: _amount
        });
        emit TokensVesting(_beneficiary, _amount);
    }

    function release(uint256 _vestingId) public {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp >= vestings[_vestingId].releaseTime);

        require(_token.balanceOf(address(this)) > 0);

        _token.safeTransfer(vestings[_vestingId].beneficiary, vestings[_vestingId].amount);
        emit TokensReleased(vestings[_vestingId].beneficiary, vestings[_vestingId].amount);
        delete vestings[_vestingId];
    }
}
