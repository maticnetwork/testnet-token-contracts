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
        //test data
        uint256 SCALING_FACTOR = 10 ** 18;
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 0, 1900000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 0, 117990560 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 6, 117990560 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 0, 184000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 6, 184000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 220110000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 220110000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 24, 226780000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 6, 132000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 132000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 136000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 6, 495000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 495000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 510000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 0, 1200000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 24, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 30, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 36, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 42, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 266666666 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 266666666 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 24, 266666666 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 30, 266666666 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 36, 266666666 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 42, 266666666 * SCALING_FACTOR);
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

    function removeVesting(uint256 _vestingId) public onlyOwner {
        require(vestings[_vestingId].beneficiary != address(0x0) && !vestings[_vestingId].released);
        vestings[_vestingId].released = true;
    }

    function addVesting(address _beneficiary, uint256 _releaseTime, uint256 _amount) public onlyOwner {
        require(_beneficiary != address(0x0), "ADD_BENEFICIARY");
        vestingId = vestingId.add(1);
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

        require(_token.balanceOf(address(this)) >= vestings[_vestingId].amount);
        vestings[_vestingId].released = true;
        _token.safeTransfer(vestings[_vestingId].beneficiary, vestings[_vestingId].amount);
        emit TokensReleased(vestings[_vestingId].beneficiary, _vestingId, vestings[_vestingId].amount);
    }
}
