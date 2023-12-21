#![cfg(test)]

extern crate std;

use std::println;

use crate::storage_types::ProposalStatus;

use super::testutils::{register_test_contract as register_vote, Vote};
use soroban_sdk::{
    testutils::{Address as AddressTestTrait, Ledger},
    Address, Env, String,
};

fn create_vote_contract(e: &Env) -> Vote {
    let id = register_vote(e);
    let vote = Vote::new(e, id.clone());
    vote.client().initialize(); // initialize the contract
    vote
}

fn advance_ledger(e: &Env, delta: u64) {
    e.ledger().with_mut(|l| {
        l.timestamp += delta;
    });
}

struct Setup {
    env: Env,
    creator: Address,
    user1: Address,
    user2: Address,
    vote: Vote,
    proposal_id: u128,
}

///
impl Setup {
    fn new() -> Self {
        let e: Env = soroban_sdk::Env::default();
        let creator = Address::generate(&e);
        let user1 = Address::generate(&e);
        let user2 = Address::generate(&e);

        // Create the voting contract
        let vote = create_vote_contract(&e);
        let proposal_name = "test";
        let proposal_desc = "description";

        // Create voting proposal
        let proposal_id = vote.client().mock_all_auths().create_proposal(
            &creator,
            &String::from_str(&e, &proposal_name),
            &String::from_str(&e, &proposal_desc),
            &2,
        );

        println!("proposal_id: {}", proposal_id);

        Self {
            env: e,
            creator,
            user1,
            user2,
            vote,
            proposal_id,
        }
    }
}

// Test getting the proposal status
#[test]
fn test_get_proposal_status() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 11);

    assert_eq!(
        setup.vote.client().status(&setup.proposal_id),
        ProposalStatus::Active
    );
}

#[test]
fn test_vote() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 11);

    setup
        .vote
        .client()
        .mock_all_auths()
        .vote(&setup.proposal_id, &setup.user1);

    assert_eq!(
        setup.vote.client().status(&setup.proposal_id),
        ProposalStatus::Active
    );
}

#[test]
fn test_vote_reached_target() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 11);

    setup
        .vote
        .client()
        .mock_all_auths()
        .vote(&setup.proposal_id, &setup.user1);
    setup
        .vote
        .client()
        .mock_all_auths()
        .vote(&setup.proposal_id, &setup.user2);

    assert_eq!(
        setup.vote.client().status(&setup.proposal_id),
        ProposalStatus::Ended
    );
}

#[test]
fn test_vote_cancelled() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 11);

    setup
        .vote
        .client()
        .mock_all_auths()
        .vote(&setup.proposal_id, &setup.user1);
    setup
        .vote
        .client()
        .mock_all_auths()
        .cancel_proposal(&setup.creator, &setup.proposal_id);

    assert_eq!(
        setup.vote.client().status(&setup.proposal_id),
        ProposalStatus::Cancelled
    );
}

#[test]
fn test_get_proposals_by_user() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 11);

    setup
        .vote
        .client()
        .mock_all_auths()
        .vote(&setup.proposal_id, &setup.user1);
    setup
        .vote
        .client()
        .mock_all_auths()
        .vote(&setup.proposal_id, &setup.user2);

    let proposals = setup.vote.client().get_proposals();

    assert_eq!(proposals.len(), 1);
    assert_eq!(
        proposals.first().unwrap().name,
        String::from_str(&setup.env, "test")
    );
    assert_eq!(proposals.first().unwrap().goal, 2);
    assert_eq!(proposals.first().unwrap().created_by, setup.creator);
    assert_eq!(proposals.first().unwrap().vote_count, 2);
    assert_eq!(proposals.first().unwrap().status, ProposalStatus::Active);
    assert_eq!(proposals.first().unwrap().is_active, true);
    assert_eq!(proposals.first().unwrap().last_voted_at, 11);
    assert_eq!(proposals.first().unwrap().created_at, 0);
}
