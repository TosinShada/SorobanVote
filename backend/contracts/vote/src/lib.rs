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

/// Get the current ledger timestamp
/// The function returns the current ledger timestamp.
fn get_ledger_timestamp(e: &Env) -> u64 {
    e.ledger().timestamp()
}

/// Get the proposal details
/// The function returns the details of a specific proposal.
fn get_proposal(e: &Env, proposal_id: &u128) -> Proposal {
    e.storage()
        .persistent()
        .get::<_, Proposal>(&DataKey::Proposals(proposal_id.clone()))
        .expect("Proposal is inactive or doesn't exist")
}

/// Get the next proposal ID
/// The function returns the next proposal ID.
/// It increments the current ID and stores it in persistent storage.
/// The function also extends the contract's lifetime.
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

/// Get the proposals created by a user
/// The function returns the list of proposals created by a specific user.
/// It retrieves the list from persistent storage.
/// The function also extends the contract's lifetime.
fn get_proposals_by_user(e: &Env) -> Vec<u128> {
    e.storage()
        .persistent()
        .get::<_, Vec<u128>>(&DataKey::UserProposals)
        .unwrap_or(Vec::new(&e))
}

/// Set the proposals created by a user
/// The function updates the list of proposals created by a specific user with the new proposal ID.
/// It stores the list in persistent storage.
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
    /// Initialize the contract
    /// This function can only be called once per contract instance
    /// It checks whether the contract is already initialized and, if not, creates the initial NextProposalId and extends the contract's lifetime.
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

    /// Get the status of a proposal
    /// Returns the status of the proposal
    pub fn status(e: Env, proposal_id: u128) -> ProposalStatus {
        let proposal = get_proposal(&e, &proposal_id);

        return proposal.status;
    }

    /// Create a new proposal
    /// The proposal is created with the following parameters: name, description, goal
    /// The function allows the users to create a new voting proposal.
    /// It performs validation checks, including verifying the sender's authorization, generates a unique proposal ID, and stores the proposal details in persistent storage.
    /// The function emits relevant events to notify other stakeholders.
    /// Returns the proposal ID
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

    /// Vote for a proposal
    /// The function enables users to cast their votes for a specific proposal.
    /// It checks the proposal's status, updates the vote count, and emits relevant events to notify other stakeholders.
    /// The function performs validation checks, including verifying the sender's authorization, and checks whether the proposal is active.
    /// If the proposal is not active, the function reverts.
    pub fn vote(e: Env, proposal_id: u128, voter: Address) {
        voter.require_auth();
        let mut proposal = get_proposal(&e, &proposal_id);
        assert!(proposal.is_active, "proposal is not active");
        assert!(
            proposal.status == ProposalStatus::Active,
            "proposal is not active"
        );

        // Check if the proposal has reached its goal and update the status accordingly
        // If the proposal has reached its goal, the function emits relevant events to notify other stakeholders and stops execution.
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
        } else {
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
    }

    /// Cancel Proposal
    /// The function enables the creator of a proposal to cancel it.
    /// It performs validation checks, including verifying the sender's authorization, and checks whether the proposal is active.
    /// If the proposal is not active, the function reverts.
    /// The function updates the proposal's status and emits relevant events to notify other stakeholders.
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

    /// Get the details of a proposal
    /// The function returns the details of a specific proposal.
    pub fn get_proposal(e: Env, proposal_id: u128) -> Proposal {
        get_proposal(&e, &proposal_id)
    }

    /// Get the proposals created by a user
    /// The function returns the list of proposals created by a specific user.
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
