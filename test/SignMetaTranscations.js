const { expect } = require("chai");
const { ethers } = require("hardhat");
const { signMetaTxRequest } = require("../utils/signer");
const { relay } = require("../autoTasks/relay");

async function deploy(name, ...params) {
  const Contract = await ethers.getContractFactory(name);
  return await Contract.deploy(...params).then((f) => f.deployed());
}

describe.only("autotasks/relay", function () {
  let forwarder;
  let registry;
  let accounts;
  let signer;
  beforeEach(async function () {
    forwarder = await deploy("MinimalForwarder");
    registry = await deploy("Registry", forwarder.address);
    mockToken = await deploy(
      "MockToken",
      "Mock Token",
      "MT_1",
      forwarder.address
    );
    accounts = await ethers.getSigners();
    signer = accounts[2];
  });

  it("registers a name via a meta-tx", async function () {
    // const { forwarder, registry, signer } = this;
    // console.log("**@ signer is , ", signer);
    // console.log("**@ forwarder is , ", forwarder);
    // console.log("**@ before calling sign meta transaction");

    const { request, signature } = await signMetaTxRequest(
      signer.provider,
      forwarder,
      {
        from: signer.address,
        to: registry.address,
        data: registry.interface.encodeFunctionData("register", ["meta-txs"]),
      }
    );

    const whitelist = [registry.address];
    await relay(forwarder, request, signature, whitelist);

    expect(await registry.owners("meta-txs")).to.equal(signer.address);
    expect(await registry.names(signer.address)).to.equal("meta-txs");
  });

  it("transfers ERC20 token via a meta-tx", async function () {
    signer = accounts[1];
    sender = accounts[2];
    await mockToken.approve(forwarder.address, "10000000000000000");

    const { request, signature } = await signMetaTxRequest(
      signer.provider,
      forwarder,
      {
        from: signer.address,
        to: registry.address,
        data: registry.interface.encodeFunctionData("transferFrom", [
          signer.address,
          sender.address,
          "10000000000000000000",
        ]),
      }
    );

    const whitelist = [registry.address];
    await relay(forwarder, request, signature, whitelist);

    expect(await registry.owners("meta-txs")).to.equal(signer.address);
    expect(await registry.names(signer.address)).to.equal("meta-txs");
  });

  //   it("refuses to send to non-whitelisted address", async function () {
  //     const { forwarder, registry, signer } = this;

  //     const { request, signature } = await signMetaTxRequest(
  //       signer.provider,
  //       forwarder,
  //       {
  //         from: signer.address,
  //         to: registry.address,
  //         data: registry.interface.encodeFunctionData("register", ["meta-txs"]),
  //       }
  //     );

  //     const whitelist = [];
  //     await expect(
  //       relay(forwarder, request, signature, whitelist)
  //     ).to.be.rejectedWith(/rejected/i);
  //   });

  //   it("refuses to send incorrect signature", async function () {
  //     const { forwarder, registry, signer } = this;

  //     const { request, signature } = await signMetaTxRequest(
  //       signer.provider,
  //       forwarder,
  //       {
  //         from: signer.address,
  //         to: registry.address,
  //         data: registry.interface.encodeFunctionData("register", ["meta-txs"]),
  //         nonce: 5,
  //       }
  //     );

  //     const whitelist = [registry.address];
  //     await expect(
  //       relay(forwarder, request, signature, whitelist)
  //     ).to.be.rejectedWith(/invalid/i);
  //   });
});
