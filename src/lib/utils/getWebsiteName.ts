const getWebsiteName = (url: string) =>
  new URL(url).hostname.match(/^(?:www\.)?(.*)\.[a-z]{2,}$/i)?.[1];

export default getWebsiteName;
