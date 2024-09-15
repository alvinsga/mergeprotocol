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
- `create_license`: Creates a new license with specified properties.
- `register_license`: Registers a license for a token with pricing and validity information.
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
2. Create licenses using `create_license`.
3. Register licenses for tokens using `register_license`.
4. Create collections for NFTs using `create_collection`.
5. Mint license tokens using `mint_license_token`.

## Key Concepts

### Asset-License Relationship

The contract allows for associating multiple licenses with a single asset (token). This is managed through the `token_license_rel` table in the `MergeProtocol` struct.

### Parent-Child Relationships

Assets can have parent-child relationships, which are tracked bidirectionally using the `parent_child_rel` and `child_parent_rel` tables.

### License NFTs

The contract supports creating NFTs that represent licenses for assets. These are minted using the `mint_license_token` function and include a fee mechanism where 95% goes to the asset owner and 5% to the protocol.
