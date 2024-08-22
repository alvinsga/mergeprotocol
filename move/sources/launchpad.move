module launchpad::launchpad3 {
    use std::signer;
    use std::string::String;
    use aptos_framework::object::{Self, ExtendRef};

    use aptos_token_objects::aptos_token;
    use aptos_token_objects::collection;

    struct CollectionCreator has key {
        creator_extend_ref: ExtendRef,
    }

    fun init_module(creator: &signer,) {
        // Create extend ref
        let creator_constructor_ref = &object::create_object(@launchpad);
        let creator_extend_ref = object::generate_extend_ref(creator_constructor_ref);
        move_to(creator, CollectionCreator { creator_extend_ref });
    }
    
    public entry fun create_collection(
        _creator: &signer,
        description: String,
        max_supply: u64,
        collection_name: String,
        uri: String
    ) acquires  CollectionCreator {

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
        creator: &signer,
        _owner: address,
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
        object::transfer(creator_signer, tokenRef, signer::address_of(creator));
    }

    #[view]
    public fun collection_address(creator: address, collection_name: String): address {
        // Recompute the collection address given the creator and its name.
        collection::create_collection_address(&creator, &collection_name)
    }
}