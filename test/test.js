import { expect } from "chai";
import axios from "axios";
import sinon from "sinon";
import express from "express";
import supertest from "supertest";
import { OpenPoolNodeService, OpenPoolNodeController } from "../index.js";

describe("OpenPoolNodeService", () => {
  let axiosGetStub;

  beforeEach(() => {
    axiosGetStub = sinon.stub(axios, "get");
  });

  afterEach(() => {
    axiosGetStub.restore();
  });

  after((done) => {
    process.exit(); // Exit the Node.js process
  });

  it("should fetch transcoders data successfully", async () => {
    const service = new OpenPoolNodeService();
    const expectedData = {
      "0x0afc5f4500ce63aa5f029a78c3633afe0b77af99": {
        Nodes: [
          {
            Address: "139.84.140.150:43432",
            Capacity: 5,
            EthereumAddress: "0x0afc5f4500ce63aa5f029a78c3633afe0b77af99",
          },
        ],
        Pending: 4149943551000716,
        Payout: 16168361213721986,
        Region: "OCEANIA",
      },
    };

    axiosGetStub.resolves({ data: expectedData });
    const result = await service.transcoders();

    expect(result).to.deep.equals(expectedData);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(axiosGetStub.firstCall.args[0]).to.equal(
      `${service._server}/transcoders`
    );
  });

  it("should handle transcoders data fetch failure", async () => {
    const service = new OpenPoolNodeService();
    const expectedError = JSON.stringify({
      error:
        "failed to fetch pool transcoders. contact the system administrator",
      Region: "PA",
    });

    axiosGetStub.rejects(expectedError);

    try {
      await service.transcoders();
    } catch (error) {
      expect(error).to.deep.equal(expectedError);
      expect(axiosGetStub.calledOnce).to.be.true;
      expect(axiosGetStub.firstCall.args[0]).to.equal(
        `${service._server}/transcoders`
      );
    }
  });

  it("should fetch status data successfully", async () => {
    const service = new OpenPoolNodeService();
    const expectedData = {
      Commission: "0.25",
      Version: "0.7.1",
      BasePrice: "150",
      TotalPayouts: "0",
    };
    axiosGetStub.resolves({ data: expectedData });

    const result = await service.status();

    expect(result).to.deep.equals(expectedData);
    expect(axiosGetStub.calledOnce).to.be.true;
    expect(axiosGetStub.firstCall.args[0]).to.equal(
      `${service._server}/poolStats`
    );
  });

  it("should handle status data fetch failure", async () => {
    const service = new OpenPoolNodeService();
    const expectedError = JSON.stringify({
      error: "failed to fetch pool status. contact the system administrator",
      Commission: "0.00",
      Version: "0.0.0",
      BasePrice: "000",
      TotalPayouts: "000",
    });

    axiosGetStub.rejects(expectedError);

    try {
      await service.status();
    } catch (error) {
      expect(error).to.deep.equal(expectedError);
      expect(axiosGetStub.calledOnce).to.be.true;
      expect(axiosGetStub.firstCall.args[0]).to.equal(
        `${service._server}/poolStats`
      );
    }
  });
});
