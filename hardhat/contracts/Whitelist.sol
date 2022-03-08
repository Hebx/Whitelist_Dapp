//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {

    uint8 public maxWhitelistedAddresses;
     // if an address is whitelisted, we would set it to true, it is false by default for all other addresses.
    mapping(address => bool) public whitelistedAddresses;

    //keep track of how many addresses have been whitelisted
    uint8 public numAddressesWhitelisted;

    // Set the Max number of whitelisted addresses
    constructor(uint8 _maxWhitelistedAddresses)
    {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }
    // adds the address of the sender to the whitelist
    function addAddressToWhitelist() public {
        // check if the user had already been whitelisted
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "Limit of Whitelist Reached");
        // add the address which called the function to whitelistedAddress array
        whitelistedAddresses[msg.sender] = true;
        numAddressesWhitelisted += 1;
    }
}
