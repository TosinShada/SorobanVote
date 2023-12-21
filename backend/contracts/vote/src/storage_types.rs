use soroban_sdk::{contracttype, Address, String};

pub(crate) const DAY_IN_LEDGERS: u32 = 17280;
pub(crate) const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
pub(crate) const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

pub(crate) const BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
pub(crate) const LIFETIME_THRESHOLD: u32 = BUMP_AMOUNT - DAY_IN_LEDGERS;

#[derive(Clone)]
#[contracttype]
pub struct Proposal {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub goal: u128,
    pub created_at: u64,
    pub is_active: bool,
    pub status: ProposalStatus,
    pub last_voted_at: u64,
    pub vote_count: u128,
    pub created_by: Address,
}

#[derive(Clone, PartialEq, Debug)]
#[contracttype]
pub enum ProposalStatus {
    Active,
    Ended,
    Cancelled,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Proposals(u128), // proposal_id => proposal
    UserProposals,   // vec[proposal_id]
    NextProposalId,  // u128
}
