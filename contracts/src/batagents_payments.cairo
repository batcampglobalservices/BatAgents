use starknet::ContractAddress;
use starknet::storage::Map;
use starknet::{get_block_timestamp, get_caller_address};

#[starknet::interface]
trait IERC20<TState> {
    fn transfer_from(
        ref self: TState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) -> bool;
}

#[starknet::contract]
mod batagents_payments {
    use super::{
        get_block_timestamp,
        get_caller_address,
        ContractAddress,
        IERC20Dispatcher,
        IERC20DispatcherTrait,
        Map,
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        payment_token: ContractAddress,
        platform_fee_receiver: ContractAddress,
        agent_registered: Map<felt252, bool>,
        agent_creator: Map<felt252, ContractAddress>,
        agent_price: Map<felt252, u256>,
        agent_active: Map<felt252, bool>,
        has_hired: Map<(felt252, ContractAddress), bool>,
        agent_total_hires: Map<felt252, u256>,
        agent_total_earnings: Map<felt252, u256>,
    }

    #[derive(Drop, starknet::Event)]
    struct AgentRegistered {
        agent_id: felt252,
        creator: ContractAddress,
        price: u256,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct AgentHired {
        agent_id: felt252,
        creator: ContractAddress,
        buyer: ContractAddress,
        amount: u256,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct AgentStatusUpdated {
        agent_id: felt252,
        active: bool,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentWithdrawn {
        agent_id: felt252,
        recipient: ContractAddress,
        amount: u256,
        timestamp: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AgentRegistered: AgentRegistered,
        AgentHired: AgentHired,
        AgentStatusUpdated: AgentStatusUpdated,
        PaymentWithdrawn: PaymentWithdrawn,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        platform_fee_receiver: ContractAddress,
        payment_token: ContractAddress,
    ) {
        self.owner.write(owner);
        self.platform_fee_receiver.write(platform_fee_receiver);
        self.payment_token.write(payment_token);
    }

    #[external(v0)]
    fn register_agent(ref self: ContractState, agent_id: felt252, price: u256) {
        let caller = get_caller_address();

        self.agent_registered.write(agent_id, true);
        self.agent_creator.write(agent_id, caller);
        self.agent_price.write(agent_id, price);
        self.agent_active.write(agent_id, true);

        self.emit(AgentRegistered {
            agent_id,
            creator: caller,
            price,
            timestamp: get_block_timestamp(),
        });
    }

    #[external(v0)]
    fn update_agent_price(ref self: ContractState, agent_id: felt252, new_price: u256) {
        let caller = get_caller_address();
        let owner = self.owner.read();
        let creator = self.agent_creator.read(agent_id);

        assert(
            caller == owner || caller == creator,
            'Not authorized',
        );

        self.agent_price.write(agent_id, new_price);
    }

    #[external(v0)]
    fn set_agent_active(ref self: ContractState, agent_id: felt252, active: bool) {
        let caller = get_caller_address();
        let owner = self.owner.read();
        let creator = self.agent_creator.read(agent_id);

        assert(
            caller == owner || caller == creator,
            'Not authorized',
        );

        self.agent_active.write(agent_id, active);

        self.emit(AgentStatusUpdated {
            agent_id,
            active,
            timestamp: get_block_timestamp(),
        });
    }

    #[external(v0)]
    fn hire_agent(
        ref self: ContractState,
        agent_id: felt252,
        creator: ContractAddress,
        price_low: u256,
    ) {
        let buyer = get_caller_address();
        let price = price_low;

        let already_registered = self.agent_registered.read(agent_id);
        if !already_registered {
            self.agent_registered.write(agent_id, true);
            self.agent_creator.write(agent_id, creator);
            self.agent_price.write(agent_id, price);
            self.agent_active.write(agent_id, true);

            self.emit(AgentRegistered {
                agent_id,
                creator,
                price,
                timestamp: get_block_timestamp(),
            });
        } else {
            assert(self.agent_creator.read(agent_id) == creator, 'Creator mismatch');
            assert(self.agent_price.read(agent_id) == price, 'Price mismatch');
        }

        assert(self.agent_active.read(agent_id), 'Agent inactive');
        assert(!self.has_hired.read((agent_id, buyer)), 'Already hired');

        let token = IERC20Dispatcher {
            contract_address: self.payment_token.read(),
        };
        let payment_ok = token.transfer_from(buyer, creator, price);
        assert(payment_ok, 'Payment transfer failed');

        self.has_hired.write((agent_id, buyer), true);

        let next_hires = self.agent_total_hires.read(agent_id) + u256 { low: 1, high: 0 };
        let next_earnings = self.agent_total_earnings.read(agent_id) + price;
        self.agent_total_hires.write(agent_id, next_hires);
        self.agent_total_earnings.write(agent_id, next_earnings);

        self.emit(AgentHired {
            agent_id,
            creator,
            buyer,
            amount: price,
            timestamp: get_block_timestamp(),
        });
    }

    #[external(v0)]
    fn has_user_hired(
        self: @ContractState,
        agent_id: felt252,
        buyer: ContractAddress,
    ) -> bool {
        self.has_hired.read((agent_id, buyer))
    }

    #[external(v0)]
    fn get_agent_price(self: @ContractState, agent_id: felt252) -> u256 {
        self.agent_price.read(agent_id)
    }

    #[external(v0)]
    fn get_agent_creator(
        self: @ContractState,
        agent_id: felt252,
    ) -> ContractAddress {
        self.agent_creator.read(agent_id)
    }

    #[external(v0)]
    fn get_agent_total_hires(self: @ContractState, agent_id: felt252) -> u256 {
        self.agent_total_hires.read(agent_id)
    }

    #[external(v0)]
    fn get_agent_total_earnings(self: @ContractState, agent_id: felt252) -> u256 {
        self.agent_total_earnings.read(agent_id)
    }
}
