module launchpad::launchpad9 {
    use std::string::String;
    use std::vector;
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::hash;
    use std::bcs;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_framework::object::{Object};

    use aptos_token_objects::aptos_token;
    use aptos_token_objects::aptos_token::AptosToken;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;


    struct CollectionCreator has key {
        creator_extend_ref: ExtendRef
    }

    struct MergeProtocol has key {
        // Parent to child and child to parent rels to store
        // relationships to derivative works
        parent_child_rel: SmartTable<address, vector<address>>,
        child_parent_rel: SmartTable<address, vector<address>>,
        // Main table: stores relationship between Asset and License IDs
        token_license_rel: SmartTable<address, vector<u64>>,
        // License table storing license IDs (which are pre-created)
        license_table: SmartTable<u64, License>,
        // Stores the license data for each asset + license ID
        hash_licenseConfig_rel: SmartTable<vector<u8>, LicenseConfig>,
        // stores relationship between License NFT minted and Asset NFT
        nft_license_table: SmartTable<address, NFTLicenseData>,
        // Used to increment license IDs
        license_counter: u64
    }

    struct License has key, store, drop, copy {
        transferrable: bool,
        attributionRequired: bool,
        commercialUse: bool,
        derivativesAllowed: bool,
        aiUse: bool
    }

    struct LicenseConfig has key, store, drop, copy {
        price: u64,
        validity: u64,
        royaltyPercent: u64,
        royaltyAddress: address
    }

    struct NFTLicenseData has key, store, drop, copy {
        expiry: u64,
        asset: address,
        license_id: u64
    }

    // New generic function to update or create a record in a SmartTable
    fun update_or_create_record<K: drop + copy, V: drop + copy>(
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

    // Start of protocol section

    // Init contracts
    public entry fun init(creator: &signer) {
        // Only contract deployer can initialise contract
        // Change hardcoded value as appropriate
        let autorized_address =
            @0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069;
        assert!(signer::address_of(creator) == autorized_address, 0);
        let my_table = MergeProtocol {
            parent_child_rel: smart_table::new(),
            child_parent_rel: smart_table::new(),
            token_license_rel: smart_table::new(),
            license_table: smart_table::new(),
            hash_licenseConfig_rel: smart_table::new(),
            license_counter: 0,
            nft_license_table: smart_table::new()
        };
        move_to(creator, my_table);
        init_creator_ref(creator);
    }

    fun init_creator_ref(creator: &signer) {
        // Create extend ref for Collection
        let creator_constructor_ref = &object::create_object(@launchpad);
        let creator_extend_ref = object::generate_extend_ref(creator_constructor_ref);
        move_to(creator, CollectionCreator { creator_extend_ref });
    }

    public entry fun create_new_license(
        creator: &signer,
        transferrable: bool,
        attributionRequired: bool,
        commercialUse: bool,
        aiUse: bool,
        derivativesAllowed: bool
    ) acquires MergeProtocol {
        // Only let contract owner create new generic licenses
        let autorized_address =
            @0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069;
        assert!(signer::address_of(creator) == autorized_address, 0);
        let protocol = borrow_global_mut<MergeProtocol>(@launchpad);
        let license_table = &mut protocol.license_table;
        let counter = protocol.license_counter;
        counter = counter + 1;
        let license = License {
            commercialUse,
            aiUse,
            derivativesAllowed,
            transferrable,
            attributionRequired
        };
        smart_table::add(license_table, counter, license);
    }

    fun register_license_config_for_asset(
        hash: vector<u8>,
        price: u64,
        royaltyPercent: u64,
        royaltyAddress: address,
        validity: u64
    ) acquires MergeProtocol {
        let hash_licenseConfig_rel =
            &mut borrow_global_mut<MergeProtocol>(@launchpad).hash_licenseConfig_rel;
        let licenceConfig = LicenseConfig {
            price,
            royaltyPercent,
            royaltyAddress,
            validity
        };
        smart_table::add(hash_licenseConfig_rel, hash, licenceConfig);
    }

    public entry fun attach_license_to_asset(
        creator: &signer,
        token: address,
        license_id: u64,
        price: u64,
        royalty: u64,
        validity: u64
    ) acquires MergeProtocol {
        // Only allow token owner to add license
        let owner_of_token = object::owner(object::address_to_object<AptosToken>(token));
        assert!(signer::address_of(creator) == owner_of_token, 0);

        let token_license_table =
            &mut borrow_global_mut<MergeProtocol>(@launchpad).token_license_rel;
        let concatenated = vector::empty<u8>();
        vector::append(&mut concatenated, bcs::to_bytes(&token));
        vector::append(&mut concatenated, bcs::to_bytes(&license_id));
        let hash_value = hash::sha3_256(concatenated);

        update_or_create_record(token_license_table, token, license_id);
        register_license_config_for_asset(
            hash_value,
            price,
            royalty,
            signer::address_of(creator),
            validity
        )
    }

    public entry fun remove_token_license(creator: &signer,addr: address, license_id: u64) acquires MergeProtocol {
        // Only let owner remove license
        let owner_of_token = object::owner(object::address_to_object<AptosToken>(addr));
        assert!(signer::address_of(creator) == owner_of_token, 0);

        let token_license_table =
            &mut borrow_global_mut<MergeProtocol>(@launchpad).token_license_rel;

        if (smart_table::contains(token_license_table, addr)) {
            let licenses = smart_table::borrow_mut(token_license_table, addr);
            let (found, index) = vector::index_of(licenses, &license_id);
            if (found) {
                vector::remove(licenses, index);
                if (vector::is_empty(licenses)) {
                    smart_table::remove(token_license_table, addr);
                };

                // Remove corresponding entry from hash_licenseConfig_rel
                let concatenated = vector::empty<u8>();
                vector::append(&mut concatenated, bcs::to_bytes(&addr));
                vector::append(&mut concatenated, bcs::to_bytes(&license_id));
                let hash = hash::sha3_256(concatenated);
                let hash_licenseConfig_rel =
                    &mut borrow_global_mut<MergeProtocol>(@launchpad).hash_licenseConfig_rel;
                if (smart_table::contains(hash_licenseConfig_rel, hash)) {
                    smart_table::remove(hash_licenseConfig_rel, hash);
                };
            };
        }
    }

    public entry fun register_parent_child_(
        _creator: &signer, parent: address, child: address
    ) acquires MergeProtocol {
        // register parent -> child rel
        let parent_child_table =
            &mut borrow_global_mut<MergeProtocol>(@launchpad).parent_child_rel;
        update_or_create_record(parent_child_table, parent, child);

        // register child -> parent rel
        let child_parent_table =
            &mut borrow_global_mut<MergeProtocol>(@launchpad).child_parent_rel;
        update_or_create_record(child_parent_table, child, parent);
    }

    #[view]
    public fun get_license_for_asset(token: address): vector<u64> acquires MergeProtocol {
        let token_license_table =
            &borrow_global<MergeProtocol>(@launchpad).token_license_rel;
        *smart_table::borrow(token_license_table, token)
    }

    #[view]
    public fun get_license(license_id: u64): License acquires MergeProtocol {
        let table = &borrow_global<MergeProtocol>(@launchpad).license_table;
        *smart_table::borrow(table, license_id)
    }

    #[view]
    public fun get_license_config(
        token: address, license_id: u64
    ): LicenseConfig acquires MergeProtocol {
        let table = &borrow_global<MergeProtocol>(@launchpad).hash_licenseConfig_rel;
        let concatenated = vector::empty<u8>();
        vector::append(&mut concatenated, bcs::to_bytes(&token));
        vector::append(&mut concatenated, bcs::to_bytes(&license_id));
        let hash_value = hash::sha3_256(concatenated);
        *smart_table::borrow(table, hash_value)
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

    #[view]
    public fun get_NFTLicense_data(token: address): NFTLicenseData acquires MergeProtocol {
        let nft_license_table =
            &borrow_global<MergeProtocol>(@launchpad).nft_license_table;
        *smart_table::borrow(nft_license_table, token)
    }

    #[view]
    public fun collection_address(
        creator: address, collection_name: String
    ): address {
        // Recompute the collection address given the creator and its name.
        collection::create_collection_address(&creator, &collection_name)
    }

    // Start of NFT minting section

    public entry fun create_collection(
        _creator: &signer,
        description: String,
        max_supply: u64,
        collection_name: String,
        uri: String
    ) acquires CollectionCreator {
        let creator_extend_ref =
            &borrow_global<CollectionCreator>(@launchpad).creator_extend_ref;
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
            100
        );
    }

    public entry fun mint_token_to_collection(
        creator: &signer,
        description: String,
        token_name: String,
        uri: String
    ) acquires CollectionCreator {
        let _tokenRef = mint_token(creator, description, token_name, uri);
    }

    fun mint_token(
        creator: &signer,
        description: String,
        token_name: String,
        uri: String
    ): Object<AptosToken> acquires CollectionCreator {
        let creator_extend_ref =
            &borrow_global<CollectionCreator>(@launchpad).creator_extend_ref;
        let creator_signer = &object::generate_signer_for_extending(creator_extend_ref);
        let collection_name = std::string::utf8(b"Merge Protocol");
        let tokenRef =
            aptos_token::mint_token_object(
                creator_signer,
                collection_name,
                description,
                token_name,
                uri,
                vector[],
                vector[],
                vector[]
            );
        object::transfer(creator_signer, tokenRef, signer::address_of(creator));
        tokenRef
    }

    public entry fun mint_license_token(
        creator: &signer,
        description: String,
        name: String,
        uri: String,
        license_id: u64,
        token: address
    ) acquires CollectionCreator, MergeProtocol {
        // Create name of token and specify collection
        let license_token_name = std::string::utf8(b"License: ");
        std::string::append(&mut license_token_name, name);

        // check if license ID is valid
        let token_license_table =
            &borrow_global<MergeProtocol>(@launchpad).token_license_rel;
        let license_id_array = *smart_table::borrow(token_license_table, token);
        let license_id_valid = vector::contains<u64>(&license_id_array, &license_id);
        assert!(license_id_valid, 0); // Aborts with error code 0 if condition is false

        // Get price from license config table amd transfer to owner
        let table = &borrow_global<MergeProtocol>(@launchpad).hash_licenseConfig_rel;
        let concatenated = vector::empty<u8>();
        vector::append(&mut concatenated, bcs::to_bytes(&token));
        vector::append(&mut concatenated, bcs::to_bytes(&license_id));
        let hash_value = hash::sha3_256(concatenated);
        let license_config = *smart_table::borrow(table, hash_value);
        let owner_of_token = object::owner(object::address_to_object<AptosToken>(token));
        let fee_to_owner = (license_config.price * 95) / 100;
        let fee_to_protocol = (license_config.price * 5) / 100; // 5% fees
        coin::transfer<AptosCoin>(creator, owner_of_token, fee_to_owner);
        coin::transfer<AptosCoin>(
            creator,
            @0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069,
            fee_to_protocol
        );

        // Mint token
        let tokenRef = mint_token(creator, description, license_token_name, uri);

        // Update NFT license table
        let nft_license_table =
            &mut borrow_global_mut<MergeProtocol>(@launchpad).nft_license_table;
        let licenseData = NFTLicenseData { expiry: 0, asset: token, license_id };
        smart_table::add(
            nft_license_table, object::object_address(&tokenRef), licenseData
        );
    }

}
