import { ContractSpec } from 'stellar-sdk';
import { AssembledTransaction } from './assembled-tx.js';
import type { u64, u128 } from './assembled-tx.js';
import type { ClassOptions } from './method-options.js';
export * from './assembled-tx.js';
export * from './method-options.js';
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CBR7LXGT7ICE7TR6J4FX7ZCQC4MDWP442H3OGMMMGYR5RVQX7GJKFQOE";
    };
};
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
export type ProposalStatus = {
    tag: "Active";
    values: void;
} | {
    tag: "Ended";
    values: void;
} | {
    tag: "Cancelled";
    values: void;
};
/**
    
    */
export type DataKey = {
    tag: "Proposals";
    values: readonly [u128];
} | {
    tag: "UserProposals";
    values: void;
} | {
    tag: "NextProposalId";
    values: void;
};
/**
    
    */
export declare const Errors: {};
export declare class Contract {
    readonly options: ClassOptions;
    spec: ContractSpec;
    constructor(options: ClassOptions);
    private readonly parsers;
    private txFromJSON;
    readonly fromJSON: {
        initialize: (json: string) => AssembledTransaction<void>;
        status: (json: string) => AssembledTransaction<ProposalStatus>;
        createProposal: (json: string) => AssembledTransaction<bigint>;
        vote: (json: string) => AssembledTransaction<void>;
        cancelProposal: (json: string) => AssembledTransaction<void>;
        getProposal: (json: string) => AssembledTransaction<Proposal>;
        getProposals: (json: string) => AssembledTransaction<Proposal[]>;
    };
    /**
* Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    initialize: (options?: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number;
    }) => Promise<AssembledTransaction<void>>;
    /**
* Construct and simulate a status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    status: ({ proposal_id }: {
        proposal_id: u128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number;
    }) => Promise<AssembledTransaction<ProposalStatus>>;
    /**
* Construct and simulate a create_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    createProposal: ({ sender, name, description, goal }: {
        sender: string;
        name: string;
        description: string;
        goal: u128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number;
    }) => Promise<AssembledTransaction<bigint>>;
    /**
* Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    vote: ({ proposal_id, voter }: {
        proposal_id: u128;
        voter: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number;
    }) => Promise<AssembledTransaction<void>>;
    /**
* Construct and simulate a cancel_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    cancelProposal: ({ sender, proposal_id }: {
        sender: string;
        proposal_id: u128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number;
    }) => Promise<AssembledTransaction<void>>;
    /**
* Construct and simulate a get_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    getProposal: ({ proposal_id }: {
        proposal_id: u128;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number;
    }) => Promise<AssembledTransaction<Proposal>>;
    /**
* Construct and simulate a get_proposals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
*/
    getProposals: (options?: {
        /**
         * The fee to pay for the transaction. Default: 100.
         */
        fee?: number;
    }) => Promise<AssembledTransaction<Proposal[]>>;
}
