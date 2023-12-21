use soroban_sdk::{Address, Env, String, Symbol};

pub(crate) fn proposal_voted(e: &Env, proposal_id: u128, voter: Address) {
    let topics = (Symbol::new(e, "proposal_voted"),);
    e.events().publish(topics, (proposal_id, voter));
}

pub(crate) fn proposal_created(
    e: &Env,
    proposal_id: u128,
    created_by: Address,
    name: String,
    created_at: u64,
) {
    let topics = (Symbol::new(e, "proposal_created"),);
    e.events()
        .publish(topics, (created_by, proposal_id, name, created_at));
}

pub(crate) fn proposal_reached_target(e: &Env, proposal_id: u128, target: u128) {
    let topics = (Symbol::new(e, "proposal_reached_target"),);
    e.events().publish(topics, (proposal_id, target));
}

pub(crate) fn proposal_cancelled(e: &Env, proposal_id: u128) {
    let topics = (Symbol::new(e, "proposal_cancelled"),);
    e.events().publish(topics, proposal_id);
}
