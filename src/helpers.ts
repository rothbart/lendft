import axios, { AxiosRequestConfig } from "axios";

export async function getNFTs(owner: string, testNetwork: boolean) {
  // https://docs.opensea.io/reference/getting-assets
  var config: AxiosRequestConfig = {
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

  const tokenData: any[] = res.data?.assets || [];

  return tokenData.map((tokenData) => ({
    name: tokenData?.name,
    id: tokenData?.id,
    image_url: tokenData?.image_thumbnail_url,
    permalink: tokenData?.permalink,
    contract_address: tokenData?.asset_contract?.address,
    type: tokenData?.asset_contract?.asset_contract_type,
  }));
}
export type NFTList = Awaited<ReturnType<typeof getNFTs>>;
