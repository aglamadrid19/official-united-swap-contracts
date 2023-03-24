const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UnitedSwap Reserve", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployUnitedSwapReserveFixture() {
    const [owner, burnAdmin, otherAccount] = await ethers.getSigners();

    const UnitedSwapToken = await ethers.getContractFactory("UnitedSwapToken");
    const unitedswaptoken = await UnitedSwapToken.deploy();

    unitedswaptoken.deployed()

    const UnitedSwapReserve = await ethers.getContractFactory("UnitedSwapReserve");
    const unitedswapreserve = await UnitedSwapReserve.deploy(unitedswaptoken.address, burnAdmin.address);

    unitedswapreserve.deployed()

    const MockBEP20 = await ethers.getContractFactory("MockBEP20");
    const mockbep20 = await MockBEP20.deploy();

    mockbep20.deployed();

    await unitedswapreserve.deployed()
    await unitedswaptoken.transferOwnership(unitedswapreserve.address)

    return { unitedswapreserve, unitedswaptoken, mockbep20, owner, otherAccount };
  }

  describe("Basic checks", function () {
    it("Should add / set pool if called by owner", async function () {
      const {
        unitedswapreserve,
        unitedswaptoken,
        mockbep20,
        owner
      } = await loadFixture(deployUnitedSwapReserveFixture);

      const maxAllocPoint = ethers.utils.parseUnits("100");
      const halfAllocPoint = ethers.utils.parseUnits("50");

      expect(await unitedswapreserve.poolLength()).to.equal("0");
      await unitedswapreserve.add(maxAllocPoint, mockbep20.address, 'True', 'True');
      expect(await unitedswapreserve.poolLength()).to.equal("1");

      const poolInfo = await unitedswapreserve.poolInfo(0)

      expect(poolInfo.allocPoint).to.equal(maxAllocPoint);
      await unitedswapreserve.set("0", halfAllocPoint, 'True');
    });

    it("Should revert if add pool called not by owner", async function () {
      const {
        unitedswapreserve,
        otherAccount,
        mockbep20
      } = await loadFixture(deployUnitedSwapReserveFixture);

      const maxAllocPoint = ethers.utils.parseUnits("100");

      await expect(unitedswapreserve.connect(otherAccount).add(maxAllocPoint, mockbep20.address, 'True', 'True')).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should mint if called by owner", async function () {
      const { 
        unitedswaptoken,
        owner,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const mintAmount = ethers.utils.parseUnits("100");

      expect(await unitedswaptoken.totalSupply()).to.equal("0");

      await unitedswaptoken['mint(uint256)'](mintAmount)
      ownerBalance = await unitedswaptoken.balanceOf(owner.address)
      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount);
    });

    it("Should not mint if called by otherAccount", async function () {
      const { 
        unitedswaptoken,
        owner,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const mintAmount = ethers.utils.parseUnits("100");
      let ownerBalance;

      expect(await unitedswaptoken.totalSupply()).to.equal("0");

      await expect(unitedswaptoken.connect(otherAccount)['mint(uint256)'](mintAmount)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should be able to transfer back and forth", async function () {
      const { 
        unitedswaptoken,
        owner,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const mintAmount = ethers.utils.parseUnits("100");

      expect(await unitedswaptoken.totalSupply()).to.equal("0");

      await unitedswaptoken['mint(uint256)'](mintAmount);

      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount);

      await unitedswaptoken.transfer(otherAccount.address, mintAmount);
      expect(await unitedswaptoken.balanceOf(otherAccount.address)).to.equal(mintAmount);
      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(0);

      await unitedswaptoken.connect(otherAccount).transfer(owner.address, mintAmount);
      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount);
      expect(await unitedswaptoken.balanceOf(otherAccount.address)).to.equal(0);
    });
  });
});
