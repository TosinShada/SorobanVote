import { ContractSpec, Address } from 'stellar-sdk';
import { Buffer } from "buffer";
import { AssembledTransaction, Ok, Err } from './assembled-tx.js';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
  Error_,
  Result,
} from './assembled-tx.js';
import type { ClassOptions, XDR_BASE64 } from './method-options.js';

export * from './assembled-tx.js';
export * from './method-options.js';

if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}


export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CBR7LXGT7ICE7TR6J4FX7ZCQC4MDWP442H3OGMMMGYR5RVQX7GJKFQOE",
    }
} as const

/**
    
    */
export interface Proposal {
  /**
    
    */
created_at: u64;
  /**
    
    */
created_by: string;
  /**
    
    */
description: string;
  /**
    
    */
goal: u128;
  /**
    
    */
id: u128;
  /**
    
    */
is_active: boolean;
  /**
    
    */
last_voted_at: u64;
  /**
    
    */
name: string;
  /**
    
    */
status: ProposalStatus;
  /**
    
    */
vote_count: u128;
}

/**
    
    */
export type ProposalStatus = {tag: "Active", values: void} | {tag: "Ended", values: void} | {tag: "Cancelled", values: void};

/**
    
    */
export type DataKey = {tag: "Proposals", values: readonly [u128]} | {tag: "UserProposals", values: void} | {tag: "NextProposalId", values: void};

/**
    
    */
export const Errors = {

}

export class Contract {
    spec: ContractSpec;
    constructor(public readonly options: ClassOptions) {
        this.spec = new ContractSpec([
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
    private readonly parsers = {
        initialize: () => {},
        status: (result: XDR_BASE64): ProposalStatus => this.spec.funcResToNative("status", result),
        createProposal: (result: XDR_BASE64): u128 => this.spec.funcResToNative("create_proposal", result),
        vote: () => {},
        cancelProposal: () => {},
        getProposal: (result: XDR_BASE64): Proposal => this.spec.funcResToNative("get_proposal", result),
        getProposals: (result: XDR_BASE64): Array<Proposal> => this.spec.funcResToNative("get_proposals", result)
    };
    private txFromJSON = <T>(json: string): AssembledTransaction<T> => {
        const { method, ...tx } = JSON.parse(json)
        return AssembledTransaction.fromJSON(
            {
                ...this.options,
                method,
                parseResultXdr: this.parsers[method],
            },
            tx,
        );
    }
    public readonly fromJSON = {
        initialize: this.txFromJSON<ReturnType<typeof this.parsers['initialize']>>,
        status: this.txFromJSON<ReturnType<typeof this.parsers['status']>>,
        createProposal: this.txFromJSON<ReturnType<typeof this.parsers['createProposal']>>,
        vote: this.txFromJSON<ReturnType<typeof this.parsers['vote']>>,
        cancelProposal: this.txFromJSON<ReturnType<typeof this.parsers['cancelProposal']>>,
        getProposal: this.txFromJSON<ReturnType<typeof this.parsers['getProposal']>>,
        getProposals: this.txFromJSON<ReturnType<typeof this.parsers['getProposals']>>
    }
        /**
    * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
    */
    initialize = async (options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number,
    } = {}) => {
        return await AssembledTransaction.fromSimulation({
            method: 'initialize',
            args: this.spec.funcArgsToScVals("initialize", {}),
            ...options,
            ...this.options,
            errorTypes: Errors,
            parseResultXdr: this.parsers['initialize'],
        });
    }


        /**
    * Construct and simulate a status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
    */
    status = async ({proposal_id}: {proposal_id: u128}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number,
    } = {}) => {
        return await AssembledTransaction.fromSimulation({
            method: 'status',
            args: this.spec.funcArgsToScVals("status", {proposal_id}),
            ...options,
            ...this.options,
            errorTypes: Errors,
            parseResultXdr: this.parsers['status'],
        });
    }


        /**
    * Construct and simulate a create_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
    */
    createProposal = async ({sender, name, description, goal}: {sender: string, name: string, description: string, goal: u128}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number,
    } = {}) => {
        return await AssembledTransaction.fromSimulation({
            method: 'create_proposal',
            args: this.spec.funcArgsToScVals("create_proposal", {sender: new Address(sender), name, description, goal}),
            ...options,
            ...this.options,
            errorTypes: Errors,
            parseResultXdr: this.parsers['createProposal'],
        });
    }


        /**
    * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
    */
    vote = async ({proposal_id, voter}: {proposal_id: u128, voter: string}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number,
    } = {}) => {
        return await AssembledTransaction.fromSimulation({
            method: 'vote',
            args: this.spec.funcArgsToScVals("vote", {proposal_id, voter: new Address(voter)}),
            ...options,
            ...this.options,
            errorTypes: Errors,
            parseResultXdr: this.parsers['vote'],
        });
    }


        /**
    * Construct and simulate a cancel_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
    */
    cancelProposal = async ({sender, proposal_id}: {sender: string, proposal_id: u128}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number,
    } = {}) => {
        return await AssembledTransaction.fromSimulation({
            method: 'cancel_proposal',
            args: this.spec.funcArgsToScVals("cancel_proposal", {sender: new Address(sender), proposal_id}),
            ...options,
            ...this.options,
            errorTypes: Errors,
            parseResultXdr: this.parsers['cancelProposal'],
        });
    }


        /**
    * Construct and simulate a get_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
    */
    getProposal = async ({proposal_id}: {proposal_id: u128}, options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number,
    } = {}) => {
        return await AssembledTransaction.fromSimulation({
            method: 'get_proposal',
            args: this.spec.funcArgsToScVals("get_proposal", {proposal_id}),
            ...options,
            ...this.options,
            errorTypes: Errors,
            parseResultXdr: this.parsers['getProposal'],
        });
    }


        /**
    * Construct and simulate a get_proposals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
    */
    getProposals = async (options: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number,
    } = {}) => {
        return await AssembledTransaction.fromSimulation({
            method: 'get_proposals',
            args: this.spec.funcArgsToScVals("get_proposals", {}),
            ...options,
            ...this.options,
            errorTypes: Errors,
            parseResultXdr: this.parsers['getProposals'],
        });
    }

}