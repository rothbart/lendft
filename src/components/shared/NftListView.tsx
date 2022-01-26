import React from "react";

import Button from '@mui/material/Button';

const NftListView = (props: any) => {
    const { nfts, action } = props;

    if (!nfts.length) {
        return <p>No NFTs found</p>;
    }

    return (
        <table className="table">
            <thead>
                <tr>
                <th scope="col" className="columnheader">
                    Image
                </th>
                <th scope="col" className="columnheader">
                    Name
                </th>
                <th scope="col" className="columnheader">
                    ID
                </th>
                <th scope="col" className="columnheader">
                    Contract
                </th>
                { action && 
                    <th scope="col" className="columnheader">
                        {" "}
                    </th>
                }
                </tr>
            </thead>
            <tbody>
                {nfts.map((nft: any) => {
                    return (
                        <tr key={nft.name}>
                        <th scope="row" className="cell">
                            <img src={nft.image_url} alt="nft" />
                        </th>
                        <th scope="row" className="cell">
                            <a href={nft.permalink} target="_newTab">
                            {nft.name}
                            </a>
                        </th>
                        <td className="cell">{nft.id}</td>
                        <td className="cell">{nft.contract_address}</td>
                        { action && <Button onClick={() => { action.onClick(nft) }}>{action.name}</Button>}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default NftListView;