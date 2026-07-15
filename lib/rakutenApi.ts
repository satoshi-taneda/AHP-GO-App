
export async function fetchRakutenItems(keyword: string) {
  const appId = process.env.NEXT_PUBLIC_RAKUTEN_APP_ID
  if (!appId) throw new Error("Rakuten APP ID が設定されていません")
  const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?applicationId=${appId}`
    + `&keyword=${encodeURIComponent(keyword)}`
    + `&sort=standard`
    + `&hits=30`

  const res = await fetch(url)
  if (!res.ok) {
    console.log(await res.text())
    throw new Error("楽天APIの取得に失敗しました")
  }

  const data = await res.json()
  return data.Items.map((item: any) => ({
    name: item.Item.itemName,
    image: item.Item.mediumImageUrls[0]?.imageUrl
      ? item.Item.mediumImageUrls[0]?.imageUrl.replace("/^http:/", "https:")
      : "/no-image.png",
    url: item.Item.itemUrl,
    price: item.Item.itemPrice,
  }))
}
