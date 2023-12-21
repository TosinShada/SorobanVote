#![cfg(test)]

use crate::VoteClient;

use soroban_sdk::{Address, Env};

pub fn register_test_contract(e: &Env) -> Address {
    e.register_contract(None, crate::Vote {})
}

pub struct Vote {
    env: Env,
    contract_id: Address,
}

impl Vote {
    #[must_use]
    pub fn client(&self) -> VoteClient {
        VoteClient::new(&self.env, &self.contract_id)
    }

    #[must_use]
    pub fn new(env: &Env, contract_id: Address) -> Self {
        Self {
            env: env.clone(),
            contract_id,
        }
    }
}
