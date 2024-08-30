module launchpad::launchpad5 {
    use std::string::String;
    use std::vector;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_framework::object::{Self, ExtendRef};

    use aptos_token_objects::aptos_token;
    use aptos_token_objects::collection;

    struct CollectionCreator has key {
        creator_extend_ref: ExtendRef,
    }

    struct MergeProtocol has key {
        parent_child_rel: SmartTable<address, vector<address>>,
        child_parent_rel: SmartTable<address, vector<address>>,
        token_license_rel: SmartTable<address, vector<License>>
    }

    struct License has key, store, drop, copy {
        royalty: bool,
        price: u64,
        attributionRequired: bool
    }

    fun init_creator_ref(creator: &signer, ) {
        // Create extend ref for Collection
        let creator_constructor_ref = &object::create_object(@launchpad);
        let creator_extend_ref = object::generate_extend_ref(creator_constructor_ref);
        move_to(creator, CollectionCreator { creator_extend_ref });
    }

    // Start of protocol section
    public entry fun init_table(creator: &signer, ) {
        let my_table = MergeProtocol {
            parent_child_rel: smart_table::new(),
            child_parent_rel: smart_table::new(),
            token_license_rel: smart_table::new(),
        };
        move_to(creator, my_table);
    }

    // New generic function to update or create a record in a SmartTable
    fun update_or_create_record<K: drop+ copy, V: drop + copy>(
        table: &mut SmartTable<K, vector<V>>,
        key: K,
        value: V
    ) {
        if (smart_table::contains(table, key)) {
            let mut_ref = smart_table::borrow_mut(table, key);
            vector::push_back(mut_ref, value);
        } else {
            smart_table::add(table, key, vector::singleton(value));
        }
    }

    public entry fun register_license(
        _creator: &signer,
        token: address,
        royalty: bool,
        price: u64,
        attributionRequired: bool
    ) acquires MergeProtocol {
        let token_license_table = &mut borrow_global_mut<MergeProtocol>(@launchpad).token_license_rel;
        let license = License {
            royalty,
            price,
            attributionRequired
        };
        update_or_create_record(token_license_table, token, license);
    }

    public entry fun register_parent_child(
        _creator: &signer,
        parent: address,
        child: address
    ) acquires MergeProtocol {
        let parent_child_table = &mut borrow_global_mut<MergeProtocol>(@launchpad).parent_child_rel;
        update_or_create_record(parent_child_table, parent, child);
    }

    public entry fun register_child_parent(
        _creator: &signer,
        child: address,
        parent: address,
    ) acquires MergeProtocol {
        let child_parent_table = &mut borrow_global_mut<MergeProtocol>(@launchpad).child_parent_rel;
        update_or_create_record(child_parent_table, child, parent);
    }

    #[view]
    public fun get_license(token: address): vector<License> acquires MergeProtocol {
        let token_license_table = &borrow_global<MergeProtocol>(@launchpad).token_license_rel;
        *smart_table::borrow(token_license_table, token)
    }

    #[view]
    public fun get_parent(token: address): vector<address> acquires MergeProtocol {
        let parent_table = &borrow_global<MergeProtocol>(@launchpad).parent_child_rel;
        *smart_table::borrow(parent_table, token)
    }

    #[view]
    public fun get_child(token: address): vector<address> acquires MergeProtocol {
        let child_table = &borrow_global<MergeProtocol>(@launchpad).child_parent_rel;
        *smart_table::borrow(child_table, token)
    }
    
    // Start of NFT minting section

    public entry fun create_collection(
        _creator: &signer,
        description: String,
        max_supply: u64,
        collection_name: String,
        uri: String
    ) acquires CollectionCreator {
        let creator_extend_ref = &borrow_global<CollectionCreator>(@launchpad).creator_extend_ref;
        let creator_signer = &object::generate_signer_for_extending(creator_extend_ref);

        // Create collection
        aptos_token::create_collection(
            creator_signer,
            description,
            max_supply,
            collection_name,
            uri,
            // Different settings for modifying the collection and its tokens
            false,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            // Royalty at 1%.
            0,
            100,
        );
    }

    public entry fun mint_token(
        _creator: &signer,
        owner: address,
        collection_name: String,
        description: String,
        token_name: String,
        uri: String
    ) acquires CollectionCreator {
        let creator_extend_ref = &borrow_global<CollectionCreator>(@launchpad).creator_extend_ref;
        let creator_signer = &object::generate_signer_for_extending(creator_extend_ref);

        let tokenRef = aptos_token::mint_token_object(
            creator_signer,
            collection_name,
            description,
            token_name,
            uri,
            vector[],
            vector[],
            vector[],
        );
        object::transfer(creator_signer, tokenRef, owner);
    }

    #[view]
    public fun collection_address(creator: address, collection_name: String): address {
        // Recompute the collection address given the creator and its name.
        collection::create_collection_address(&creator, &collection_name)
    }
}