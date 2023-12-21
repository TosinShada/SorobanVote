"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = exports.Errors = exports.networks = void 0;
const stellar_sdk_1 = require("stellar-sdk");
const buffer_1 = require("buffer");
const assembled_tx_js_1 = require("./assembled-tx.js");
__exportStar(require("./assembled-tx.js"), exports);
__exportStar(require("./method-options.js"), exports);
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || buffer_1.Buffer;
}
exports.networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CBR7LXGT7ICE7TR6J4FX7ZCQC4MDWP442H3OGMMMGYR5RVQX7GJKFQOE",
    }
};
/**
    
    */
exports.Errors = {};
class Contract {
    options;
    spec;
    constructor(options) {
        this.options = options;
        this.spec = new stellar_sdk_1.ContractSpec([
            "AAAAAQAAAAAAAAAAAAAACFByb3Bvc2FsAAAACgAAAAAAAAAKY3JlYXRlZF9hdAAAAAAABgAAAAAAAAAKY3JlYXRlZF9ieQAAAAAAEwAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAEZ29hbAAAAAoAAAAAAAAAAmlkAAAAAAAKAAAAAAAAAAlpc19hY3RpdmUAAAAAAAABAAAAAAAAAA1sYXN0X3ZvdGVkX2F0AAAAAAAABgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA5Qcm9wb3NhbFN0YXR1cwAAAAAAAAAAAAp2b3RlX2NvdW50AAAAAAAK",
            "AAAAAgAAAAAAAAAAAAAADlByb3Bvc2FsU3RhdHVzAAAAAAADAAAAAAAAAAAAAAAGQWN0aXZlAAAAAAAAAAAAAAAAAAVFbmRlZAAAAAAAAAAAAAAAAAAACUNhbmNlbGxlZAAAAA==",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAACVByb3Bvc2FscwAAAAAAAAEAAAAKAAAAAAAAAAAAAAANVXNlclByb3Bvc2FscwAAAAAAAAAAAAAAAAAADk5leHRQcm9wb3NhbElkAAA=",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAAAAAAA=",
            "AAAAAAAAAAAAAAAGc3RhdHVzAAAAAAABAAAAAAAAAAtwcm9wb3NhbF9pZAAAAAAKAAAAAQAAB9AAAAAOUHJvcG9zYWxTdGF0dXMAAA==",
            "AAAAAAAAAAAAAAAPY3JlYXRlX3Byb3Bvc2FsAAAAAAQAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAABGdvYWwAAAAKAAAAAQAAAAo=",
            "AAAAAAAAAAAAAAAEdm90ZQAAAAIAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAoAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAAPY2FuY2VsX3Byb3Bvc2FsAAAAAAIAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAACgAAAAA=",
            "AAAAAAAAAAAAAAAMZ2V0X3Byb3Bvc2FsAAAAAQAAAAAAAAALcHJvcG9zYWxfaWQAAAAACgAAAAEAAAfQAAAACFByb3Bvc2Fs",
            "AAAAAAAAAAAAAAANZ2V0X3Byb3Bvc2FscwAAAAAAAAAAAAABAAAD6gAAB9AAAAAIUHJvcG9zYWw="
        ]);
    }
    parsers = {
        initialize: () => { },
        status: (result) => this.spec.funcResToNative("status", result),
        createProposal: (result) => this.spec.funcResToNative("create_proposal", result),
        vote: () => { },
        cancelProposal: () => { },
        getProposal: (result) => this.spec.funcResToNative("get_proposal", result),
        getProposals: (result) => this.spec.funcResToNative("get_proposals", result)
    };
    txFromJSON = (json) => {
        const { method, ...tx } = JSON.parse(json);
        return assembled_tx_js_1.AssembledTransaction.fromJSON({
            ...this.options,
            method,
            parseResultXdr: this.parsers[method],
        }, tx);
    };
    fromJSON = {
        initialize: (this.txFromJSON),
        status: (this.txFromJSON),
        createProposal: (this.txFromJSON),
        vote: (this.txFromJSON),
        cancelProposal: (this.txFromJSON),
        getProposal: (this.txFromJSON),
        getProposals: (this.txFromJSON)
    };
    /**
* Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    initialize = async (options = {}) => {
        return await assembled_tx_js_1.AssembledTransaction.fromSimulation({
            method: 'initialize',
            args: this.spec.funcArgsToScVals("initialize", {}),
            ...options,
            ...this.options,
            errorTypes: exports.Errors,
            parseResultXdr: this.parsers['initialize'],
        });
    };
    /**
* Construct and simulate a status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    status = async ({ proposal_id }, options = {}) => {
        return await assembled_tx_js_1.AssembledTransaction.fromSimulation({
            method: 'status',
            args: this.spec.funcArgsToScVals("status", { proposal_id }),
            ...options,
            ...this.options,
            errorTypes: exports.Errors,
            parseResultXdr: this.parsers['status'],
        });
    };
    /**
* Construct and simulate a create_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    createProposal = async ({ sender, name, description, goal }, options = {}) => {
        return await assembled_tx_js_1.AssembledTransaction.fromSimulation({
            method: 'create_proposal',
            args: this.spec.funcArgsToScVals("create_proposal", { sender: new stellar_sdk_1.Address(sender), name, description, goal }),
            ...options,
            ...this.options,
            errorTypes: exports.Errors,
            parseResultXdr: this.parsers['createProposal'],
        });
    };
    /**
* Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    vote = async ({ proposal_id, voter }, options = {}) => {
        return await assembled_tx_js_1.AssembledTransaction.fromSimulation({
            method: 'vote',
            args: this.spec.funcArgsToScVals("vote", { proposal_id, voter: new stellar_sdk_1.Address(voter) }),
            ...options,
            ...this.options,
            errorTypes: exports.Errors,
            parseResultXdr: this.parsers['vote'],
        });
    };
    /**
* Construct and simulate a cancel_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    cancelProposal = async ({ sender, proposal_id }, options = {}) => {
        return await assembled_tx_js_1.AssembledTransaction.fromSimulation({
            method: 'cancel_proposal',
            args: this.spec.funcArgsToScVals("cancel_proposal", { sender: new stellar_sdk_1.Address(sender), proposal_id }),
            ...options,
            ...this.options,
            errorTypes: exports.Errors,
            parseResultXdr: this.parsers['cancelProposal'],
        });
    };
    /**
* Construct and simulate a get_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    getProposal = async ({ proposal_id }, options = {}) => {
        return await assembled_tx_js_1.AssembledTransaction.fromSimulation({
            method: 'get_proposal',
            args: this.spec.funcArgsToScVals("get_proposal", { proposal_id }),
            ...options,
            ...this.options,
            errorTypes: exports.Errors,
            parseResultXdr: this.parsers['getProposal'],
        });
    };
    /**
* Construct and simulate a get_proposals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    getProposals = async (options = {}) => {
        return await assembled_tx_js_1.AssembledTransaction.fromSimulation({
            method: 'get_proposals',
            args: this.spec.funcArgsToScVals("get_proposals", {}),
            ...options,
            ...this.options,
            errorTypes: exports.Errors,
            parseResultXdr: this.parsers['getProposals'],
        });
    };
}
exports.Contract = Contract;
