import React from "react";

import Button from "@mui/material/Button";
import { Typography } from "@mui/material";

const NftListView = (props: any) => {
  const { nfts, action, additionalTableFields } = props;

  if (!nfts.length) {
    return (
      <Typography align="center" variant="h6">
        No NFTs found
      </Typography>
    );
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
          {additionalTableFields.map((tableField: any) => {
            return (
              <th key={tableField.name} scope="col" className="columnheader">
                {tableField.name}
              </th>
            );
          })}
          {action && (
            <th scope="col" className="columnheader">
              {" "}
            </th>
          )}
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
              {additionalTableFields.map((tableField: any) => {
                return (
                  <td key={tableField.attribute} className="cell">
                    {tableField.displayFn
                      ? tableField.displayFn(nft[tableField.attribute])
                      : nft[tableField.attribute]}
                  </td>
                );
              })}
              {action && (
                <td>
                  <Button
                    onClick={() => {
                      action.onClick(nft);
                    }}
                  >
                    {action.name}
                  </Button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default NftListView;
