import axios, { AxiosRequestConfig } from "axios";

interface Asset {
  name?: string;
  id?: number;
  token_id: string;
  image_thumbnail_url?: string;
  permalink?: string;
  asset_contract?: {
    address?: string;
    asset_contract_type?: string;
  };
}

export async function getNFTs(owner: string, testNetwork: boolean) {
  // https://docs.opensea.io/reference/getting-assets
  const config: AxiosRequestConfig = {
    method: "get",
    url: testNetwork
      ? `https://testnets-api.opensea.io/api/v1/assets`
      : `https://api.opensea.io/api/v1/assets`,
    params: {
      owner,
      offset: 0,
      limit: 50,
    },
  };

  const res = await axios(config);

  const tokenData: Asset[] = res.data?.assets || [];

  return tokenData.map((tokenData) => ({
    name: tokenData.name,
    id: parseInt(tokenData.token_id),
    image_url: tokenData.image_thumbnail_url,
    permalink: tokenData.permalink,
    contract_address: tokenData.asset_contract?.address,
    type: tokenData.asset_contract?.asset_contract_type,
  }));
}
export type NFTList = Awaited<ReturnType<typeof getNFTs>>;
