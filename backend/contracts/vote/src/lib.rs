#![no_std]
use crate::storage_types::{
    DataKey, Proposal, ProposalStatus, BUMP_AMOUNT, INSTANCE_BUMP_AMOUNT,
    INSTANCE_LIFETIME_THRESHOLD, LIFETIME_THRESHOLD,
};
use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec};

mod events;
mod storage_types;
mod test;
mod testutils;

fn get_ledger_timestamp(e: &Env) -> u64 {
    e.ledger().timestamp()
}

fn get_proposal(e: &Env, proposal_id: &u128) -> Proposal {
    e.storage()
        .persistent()
        .get::<_, Proposal>(&DataKey::Proposals(proposal_id.clone()))
        .expect("Proposal is inactive or doesn't exist")
}

fn get_next_proposal_id(e: &Env) -> u128 {
    let current_id = e
        .storage()
        .instance()
        .get::<_, u128>(&DataKey::NextProposalId)
        .expect("not initialized");

    // Bump the id and the storage
    let next_id = current_id + 1;
    e.storage()
        .instance()
        .set(&DataKey::NextProposalId, &next_id);
    e.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

    current_id
}

fn get_proposals_by_user(e: &Env) -> Vec<u128> {
    e.storage()
        .persistent()
        .get::<_, Vec<u128>>(&DataKey::UserProposals)
        .unwrap_or(Vec::new(&e))
}

fn set_proposal_by_user(e: &Env, proposal_id: &u128) {
    // Get the array of proposals for the user
    let mut proposal_ids = get_proposals_by_user(&e);
    proposal_ids.push_back(proposal_id.clone());
    e.storage()
        .persistent()
        .set(&DataKey::UserProposals, &proposal_ids);
    e.storage()
        .persistent()
        .extend_ttl(&DataKey::UserProposals, LIFETIME_THRESHOLD, BUMP_AMOUNT);
}

#[contract]
struct Vote;

#[contractimpl]
#[allow(clippy::needless_pass_by_value)]
impl Vote {
    pub fn initialize(e: Env) {
        assert!(
            !e.storage().instance().has(&DataKey::NextProposalId),
            "already initialized"
        );
        let initial_proposal_id: u128 = 1;
        e.storage()
            .instance()
            .set(&DataKey::NextProposalId, &initial_proposal_id);
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
    }

    pub fn status(e: Env, proposal_id: u128) -> ProposalStatus {
        let mut proposal = get_proposal(&e, &proposal_id);

        if proposal.status != ProposalStatus::Active {
            return proposal.status;
        }

        if proposal.vote_count >= proposal.goal {
            proposal.is_active = false;
            proposal.status = ProposalStatus::Ended;

            e.storage()
                .persistent()
                .set(&DataKey::Proposals(proposal_id), &proposal);
            e.storage().persistent().extend_ttl(
                &DataKey::Proposals(proposal_id),
                LIFETIME_THRESHOLD,
                BUMP_AMOUNT,
            );
            // emit events
            events::proposal_reached_target(&e, proposal_id, proposal.goal);
            return proposal.status;
        }

        return ProposalStatus::Active;
    }

    pub fn create_proposal(
        e: Env,
        sender: Address,
        name: String,
        description: String,
        goal: u128,
    ) -> u128 {
        sender.require_auth();
        let proposal_id = get_next_proposal_id(&e);

        let created_at = get_ledger_timestamp(&e);
        let proposal = Proposal {
            id: proposal_id,
            name: name.clone(),
            description: description.clone(),
            goal,
            created_at,
            is_active: true,
            status: ProposalStatus::Active,
            last_voted_at: 0,
            vote_count: 0,
            created_by: sender.clone(),
        };

        e.storage()
            .persistent()
            .set(&DataKey::Proposals(proposal_id), &proposal);
        e.storage().persistent().extend_ttl(
            &DataKey::Proposals(proposal_id),
            LIFETIME_THRESHOLD,
            BUMP_AMOUNT,
        );

        set_proposal_by_user(&e, &proposal_id);

        // emit events
        events::proposal_created(&e, proposal_id, sender, name, created_at);

        proposal_id
    }

    pub fn vote(e: Env, proposal_id: u128, voter: Address) {
        voter.require_auth();
        let mut proposal = get_proposal(&e, &proposal_id);
        assert!(proposal.is_active, "proposal is not active");
        assert!(
            proposal.status == ProposalStatus::Active,
            "proposal is not active"
        );
        proposal.last_voted_at = get_ledger_timestamp(&e);
        proposal.vote_count += 1;
        e.storage()
            .persistent()
            .set(&DataKey::Proposals(proposal_id), &proposal);
        e.storage().persistent().extend_ttl(
            &DataKey::Proposals(proposal_id),
            LIFETIME_THRESHOLD,
            BUMP_AMOUNT,
        );

        // emit events
        events::proposal_voted(&e, proposal_id, voter);
    }

    // Cancel Proposal
    pub fn cancel_proposal(e: Env, sender: Address, proposal_id: u128) {
        sender.require_auth();
        let mut proposal = get_proposal(&e, &proposal_id);
        assert!(
            proposal.created_by == sender,
            "only the creator can cancel the proposal"
        );
        assert!(proposal.is_active, "proposal is not active");
        assert!(
            proposal.status == ProposalStatus::Active,
            "proposal is not active"
        );
        proposal.is_active = false;
        proposal.status = ProposalStatus::Cancelled;
        e.storage()
            .persistent()
            .set(&DataKey::Proposals(proposal_id), &proposal);
        e.storage().persistent().extend_ttl(
            &DataKey::Proposals(proposal_id),
            LIFETIME_THRESHOLD,
            BUMP_AMOUNT,
        );

        events::proposal_cancelled(&e, proposal_id);
    }

    pub fn get_proposal(e: Env, proposal_id: u128) -> Proposal {
        get_proposal(&e, &proposal_id)
    }

    pub fn get_proposals(e: Env) -> Vec<Proposal> {
        let proposal_ids = get_proposals_by_user(&e);

        let mut proposals = Vec::new(&e);

        for id in proposal_ids.iter() {
            let proposal = get_proposal(&e, &id);

            proposals.push_back(proposal);
        }

        proposals
    }
}
