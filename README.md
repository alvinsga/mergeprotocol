# Overview

**Merge Protocol** is a protocol for managing digital assets, licenses, and NFTs. It provides functionality for creating and managing collections, minting tokens, and handling license configurations for digital assets.

## Key Features

- **Asset and License Management**
- **Parent-Child Relationship Tracking**
- **NFT Creation and Minting**
- **License Token Creation**

## Contract Structure

The contract is organized into several key structs and functions:

### Structs

- **CollectionCreator**: Stores the creator's extended reference for creating collections.
- **MergeProtocol**: The main struct that holds all the protocol data, including relationships between assets, licenses, and NFTs.
- **License**: Defines the properties of a license (commercial use and attribution requirements).
- **LicenseConfig**: Stores the configuration for a license (price, validity, and royalty).
- **NFTLicenseData**: Contains data about an NFT license, including expiry and associated asset.

### Main Functions

- `init_table`: Initializes the protocol's data structures.
- `create_new_license`: Creates a new license with specified properties.
- `attach_license_to_asset`: Registers a license for a token with pricing and validity information.
- `register_parent_child`: Establishes a parent-child relationship between two tokens.
- `create_collection`: Creates a new collection for NFTs.
- `mint_license_token`: Mints a new license token for a given asset.

### View Functions

- `get_license`: Retrieves license IDs for a given token.
- `get_license_data`: Fetches license data for a given license ID.
- `get_license_config_data`: Retrieves license configuration for a token and license ID.
- `get_parent` and `get_child`: Fetch parent or child tokens for a given token.
- `get_NFTLicense_data`: Retrieves NFT license data for a token.
- `collection_address`: Computes the collection address for a given creator and collection name.

## Usage

To use this contract, you need to:

1. Initialize the protocol using `init_table`.
2. Create licenses using `create_new_license`.
3. Register licenses for tokens using `attach_license_to_asset`.
4. Create collections for NFTs using `create_collection`.
5. Mint license tokens using `mint_license_token`.

## Key Concepts

### Asset-License Relationship

The contract allows for associating multiple licenses with a single asset (token). This is managed through the `token_license_rel` table in the `MergeProtocol` struct.

### Parent-Child Relationships

Assets can have parent-child relationships, which are tracked bidirectionally using the `parent_child_rel` and `child_parent_rel` tables.

### License NFTs

The contract supports creating NFTs that represent licenses for assets. These are minted using the `mint_license_token` function and include a fee mechanism where 95% goes to the asset owner and 5% to the protocol.

## Function Signatures

```rust
public entry fun init(creator: &signer)

public entry fun create_new_license(
    creator: &signer,
    transferrable: bool,
    attributionRequired: bool,
    commercialUse: bool,
    aiUse: bool,
    derivativesAllowed: bool,
)
```

## Asset and License Management Functions

```rust
public entry fun attach_license_to_asset(
    creator: &signer,
    token: address,
    license_id: u64,
    price: u64,
    royalty: u64,
    validity: u64,
)

public entry fun remove_token_license(
    addr: address,
    license_id: u64
)

public entry fun register_parent_child_(
    _creator: &signer,
    parent: address,
    child: address
)
```

## View Functions

```rust
#[view]
public fun get_license_for_asset(token: address): vector<u64>

#[view]
public fun get_license(license_id: u64): License

#[view]
public fun get_license_config(token: address, license_id: u64): LicenseConfig

#[view]
public fun get_parent(token: address): vector<address>

#[view]
public fun get_child(token: address): vector<address>

#[view]
public fun get_NFTLicense_data(token: address): NFTLicenseData

#[view]
public fun collection_address(creator: address, collection_name: String): address
```

## NFT Minting Functions

```rust
public entry fun create_collection(
    _creator: &signer,
    description: String,
    max_supply: u64,
    collection_name: String,
    uri: String
)

public entry fun mint_token_to_collection(
    creator: &signer,
    description: String,
    token_name: String,
    uri: String
)

public entry fun mint_license_token(
    creator: &signer,
    description: String,
    name: String,
    uri: String,
    license_id: u64,
    token: address
)
```

## Internal Functions (not public)

```rust
fun init_creator_ref(creator: &signer)

fun register_license_config_for_asset(
    hash: vector<u8>,
    price: u64,
    royaltyPercent: u64,
    royaltyAddress: address,
    validity: u64,
)

fun mint_token(
    creator: &signer,
    description: String,
    token_name: String,
    uri: String
) : Object<AptosToken>

fun update_or_create_record<K: drop + copy, V: drop + copy>(
    table: &mut SmartTable<K, vector<V>>,
    key: K,
    value: V
)
```


# Merge Protocol Frontend

This is the frontend application for the **Merge Protocol** platform, built with **SvelteKit**. The application interacts with the **Merge Protocol** Aptos Move contract, which manages digital assets, licenses, and NFTs. The platform allows users to create and manage collections, mint tokens, and configure licenses for digital assets.

## Overview

The **Merge Protocol** fronten provides a simple and intuitive interface to interact with the protocol contract. Users can:

- Create and manage NFT collections.
- Mint tokens with associated licenses.
- View and manage parent-child relationships between tokens.
- Access license data for NFTs.

The application is live at [https://merge.foundation](https://merge.foundation)

## Features

- **Create Collections**: Easily create and manage NFT collections.
- **Mint Tokens**: Mint NFTs with attached licenses and manage them within the app.
- **Attach Licenses to existing Tokens**: Attach licenses to existing NFTs.
- **Mint and Trade License NFTs**: Easily buy licenses which are minted as NFTs and tradeable on NFT marketplaces.
- **View Licenses**: Retrieve and display license data for assets.
- **Track Parent-Child Relationships (In development)** : View the relationship between assets and their associated licenses.
